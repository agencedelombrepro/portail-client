import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { clientId, provider } = await request.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("oauth_connections")
    .delete()
    .eq("client_id", clientId)
    .eq("provider", provider);

  return NextResponse.json({ ok: true });
}
