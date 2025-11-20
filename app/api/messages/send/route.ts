"use server";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { sendNewMessageEmail } from "@/lib/email/sendNewMessageEmail";

export async function POST(request: NextRequest) {
  try {
    const sender = await getCurrentUser();
    if (!sender) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content, appointmentId, attachments } = body;

    if (!receiverId || !content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Receiver and content are required." }, { status: 400 });
    }

    if (receiverId === sender.id) {
      return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
    }

    const supabase = await createSupabaseServerComponentClient();

    const { data: receiver, error: receiverError } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: sender.id,
        receiver_id: receiverId,
        appointment_id: appointmentId || null,
        content: content.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let conversationPath = "/messages";
    if (receiver.role === "senior") {
      conversationPath = `/senior/messages/${sender.id}`;
    } else if (receiver.role === "specialist") {
      conversationPath = `/specialist/messages/${sender.id}`;
    } else if (receiver.role === "admin") {
      conversationPath = "/admin/messages";
    }
    if (appointmentId) {
      conversationPath += `?appointment=${appointmentId}`;
    }
    const conversationUrl = `${appUrl}${conversationPath}`;

    try {
      await sendNewMessageEmail({
        to: receiver.email,
        recipientName: receiver.full_name,
        senderName: sender.full_name || sender.email,
        conversationUrl,
      });
    } catch (emailError) {
      console.error("Failed to send message email notification:", emailError);
      // Do not fail the request if email fails
    }

    return NextResponse.json({ message: data });
  } catch (err: any) {
    console.error("Unexpected error sending message:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


