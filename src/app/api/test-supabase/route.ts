import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase.from("contacts").select("*").limit(1);
  if (error) return NextResponse.json({ ok: false, error });
  return NextResponse.json({ ok: true, data });
}
