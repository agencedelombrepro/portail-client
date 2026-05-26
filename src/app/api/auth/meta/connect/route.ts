import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const APP_ID     = process.env.META_APP_ID!;
const REDIRECT   = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/meta/callback";
const SCOPES     = "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,read_insights";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = request.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "Missing client_id" }, { status: 400 });

  // state = random token stored in cookie → prevents CSRF
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", JSON.stringify({ state, clientId, provider: "meta" }), {
    httpOnly: true,
    maxAge: 600,
    path: "/",
  });

  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id",     APP_ID);
  url.searchParams.set("redirect_uri",  REDIRECT);
  url.searchParams.set("scope",         SCOPES);
  url.searchParams.set("state",         state);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
