import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const REDIRECT  = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/linkedin/callback";
const SCOPES    = "r_organization_social,r_basicprofile";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = request.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "Missing client_id" }, { status: 400 });

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", JSON.stringify({ state, clientId, provider: "linkedin" }), {
    httpOnly: true,
    maxAge: 600,
    path: "/",
  });

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id",     CLIENT_ID);
  url.searchParams.set("redirect_uri",  REDIRECT);
  url.searchParams.set("scope",         SCOPES);
  url.searchParams.set("state",         state);

  return NextResponse.redirect(url.toString());
}
