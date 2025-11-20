"use server";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import type { UserRole } from "@/types";

const FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 400;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserWithRetry(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  userId: string
) {
  for (let attempt = 0; attempt < FETCH_RETRIES; attempt++) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (data) {
      return data;
    }

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    await wait(RETRY_DELAY_MS * (attempt + 1));
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const userRecord = await fetchUserWithRetry(supabase, userId);

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRecord.welcome_email_sent_at) {
      return NextResponse.json({ success: true, skipped: true });
    }

    await sendWelcomeEmail({
      to: userRecord.email,
      fullName: userRecord.full_name,
      role: userRecord.role as UserRole,
    });

    await supabase
      .from("users")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", userRecord.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
  }
}


