import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerComponentClient();

    // Fetch appointment to verify ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, senior_id, status")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify ownership (senior can only check their own appointments)
    if (appointment.senior_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch payment status - check for any payment first, then filter by completed
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false });

    if (allPaymentsError) {
      console.error("Error fetching payments:", allPaymentsError);
      return NextResponse.json(
        { error: "Error fetching payment status" },
        { status: 500 }
      );
    }

    // Find completed payment
    const completedPayment = allPayments?.find(p => p.status === "completed") || null;
    
    // Also check for any payment (in case status is different)
    const anyPayment = allPayments && allPayments.length > 0 ? allPayments[0] : null;

    console.log(`[Payment Status Check] Appointment: ${appointmentId}, Found ${allPayments?.length || 0} payment(s), Completed: ${completedPayment ? 'Yes' : 'No'}`);

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        status: appointment.status,
      },
      payment: completedPayment || null,
      allPayments: allPayments || [],
      hasAnyPayment: !!anyPayment,
    });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

