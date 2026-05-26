import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const CLIENT_ID     = process.env.LINKEDIN_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const REDIRECT      = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/linkedin/callback";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/client/connexions?error=linkedin_denied", request.url));
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("oauth_state")?.value;
  if (!raw) return NextResponse.redirect(new URL("/client/connexions?error=state_missing", request.url));

  const { state: savedState, clientId, provider } = JSON.parse(raw);
  cookieStore.delete("oauth_state");

  if (state !== savedState || provider !== "linkedin") {
    return NextResponse.redirect(new URL("/client/connexions?error=state_mismatch", request.url));
  }

  // Exchange code for token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "authorization_code",
      code:          code!,
      redirect_uri:  REDIRECT,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/client/connexions?error=linkedin_token", request.url));
  }

  // Get profile
  const meRes = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const me = await meRes.json();
  const name = [me.localizedFirstName, me.localizedLastName].filter(Boolean).join(" ") || "Compte LinkedIn";

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  const supabase = await createClient();
  await supabase.from("oauth_connections").upsert({
    client_id:     clientId,
    provider:      "linkedin",
    access_token:  tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at:    expiresAt,
    scopes:        "r_organization_social,r_basicprofile",
    account_name:  name,
    account_id:    me.id,
    updated_at:    new Date().toISOString(),
  }, { onConflict: "client_id,provider" });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  const dest = profile?.role === "admin"
    ? `/admin/clients/${clientId}/connexions?success=linkedin`
    : "/client/connexions?success=linkedin";

  return NextResponse.redirect(new URL(dest, request.url));
}
