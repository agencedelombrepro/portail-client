import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const APP_ID     = process.env.META_APP_ID!;
const APP_SECRET = process.env.META_APP_SECRET!;
const REDIRECT   = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/meta/callback";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/client/connexions?error=meta_denied", request.url));
  }

  // Verify state
  const cookieStore = await cookies();
  const raw = cookieStore.get("oauth_state")?.value;
  if (!raw) return NextResponse.redirect(new URL("/client/connexions?error=state_missing", request.url));

  const { state: savedState, clientId, provider } = JSON.parse(raw);
  cookieStore.delete("oauth_state");

  if (state !== savedState || provider !== "meta") {
    return NextResponse.redirect(new URL("/client/connexions?error=state_mismatch", request.url));
  }

  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT)}&client_secret=${APP_SECRET}&code=${code}`
  );
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/client/connexions?error=meta_token", request.url));
  }

  // Exchange for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
  );
  const longData = await longRes.json();
  const finalToken = longData.access_token ?? tokenData.access_token;

  // Get account name
  const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${finalToken}`);
  const me = await meRes.json();

  const expiresAt = longData.expires_in
    ? new Date(Date.now() + longData.expires_in * 1000).toISOString()
    : null;

  const supabase = await createClient();
  await supabase.from("oauth_connections").upsert({
    client_id:     clientId,
    provider:      "meta",
    access_token:  finalToken,
    refresh_token: null,
    expires_at:    expiresAt,
    scopes:        "pages_show_list,instagram_basic,instagram_manage_insights",
    account_name:  me.name ?? "Compte Meta",
    account_id:    me.id,
    updated_at:    new Date().toISOString(),
  }, { onConflict: "client_id,provider" });

  // Redirect based on who initiated (admin or client)
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const { data: profile } = await supabaseServer.from("profiles").select("role").eq("id", user!.id).single();

  const dest = profile?.role === "admin"
    ? `/admin/clients/${clientId}/connexions?success=meta`
    : "/client/connexions?success=meta";

  return NextResponse.redirect(new URL(dest, request.url));
}
