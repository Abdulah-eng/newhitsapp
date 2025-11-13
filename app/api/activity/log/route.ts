import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { logActivity } from "@/lib/utils/activityLogger";

/**
 * Client-side activity logging endpoint
 * Used for logging activities from client components
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { type, description, metadata } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    await logActivity(
      type,
      user?.id || null,
      description,
      metadata || {},
      ipAddress,
      userAgent
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

