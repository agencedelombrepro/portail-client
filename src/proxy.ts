import { NextResponse, type NextRequest } from "next/server";

// Minimal pass-through proxy — auth is enforced in layout.tsx files
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
