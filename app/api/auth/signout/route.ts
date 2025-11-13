import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activityLogger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerComponentClient();
  
  // Log logout before signing out
  if (user) {
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       undefined;
      const userAgent = request.headers.get("user-agent") || undefined;
      
      await logActivity(
        "user_logged_out",
        user.id,
        `User logged out: ${user.email}`,
        { email: user.email },
        ipAddress,
        userAgent
      );
    } catch (err) {
      // Don't block logout if logging fails
      console.error("Error logging logout:", err);
    }
  }
  
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

