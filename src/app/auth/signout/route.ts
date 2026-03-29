import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const site =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return NextResponse.redirect(new URL("/login", site), { status: 302 });
}
