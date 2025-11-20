"use server";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerComponentClient();

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Error fetching unread count:", error);
      return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err: any) {
    console.error("Unexpected error fetching unread count:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


