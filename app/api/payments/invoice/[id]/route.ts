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

    const { id } = await params;
    const supabase = await createSupabaseServerComponentClient();
    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        "*, appointment:appointment_id(*, specialist:specialist_id(full_name), senior:senior_id(full_name, email))"
      )
      .eq("id", id)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify user owns this payment
    if (payment.senior_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate simple HTML invoice
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${payment.id}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #2C2C2C;
    }
    .header {
      border-bottom: 3px solid #2C5F8D;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .header h1 {
      color: #2C5F8D;
      margin: 0;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: 600;
      color: #4A4A4A;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #2C5F8D;
      margin-top: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8E6E1;
      text-align: center;
      color: #6B6B6B;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HITS Invoice</h1>
    <p>Invoice #${payment.id.slice(0, 8).toUpperCase()}</p>
  </div>

  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Date:</span>
      <span>${new Date(payment.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status:</span>
      <span>${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
    </div>
  </div>

  <div class="info-section">
    <h2 style="color: #2C5F8D; margin-bottom: 20px;">Bill To:</h2>
    <p><strong>${payment.appointment?.senior?.full_name || "N/A"}</strong></p>
    <p>${payment.appointment?.senior?.email || ""}</p>
  </div>

  <div class="info-section">
    <h2 style="color: #2C5F8D; margin-bottom: 20px;">Service Details:</h2>
    <div class="info-row">
      <span class="info-label">Specialist:</span>
      <span>${payment.appointment?.specialist?.full_name || "N/A"}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Appointment Date:</span>
      <span>${
        payment.appointment?.scheduled_at
          ? new Date(payment.appointment.scheduled_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "N/A"
      }</span>
    </div>
    <div class="info-row">
      <span class="info-label">Duration:</span>
      <span>${payment.appointment?.duration_minutes || 0} minutes</span>
    </div>
  </div>

  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Amount:</span>
      <span class="amount">$${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}</span>
    </div>
    ${payment.refund_amount > 0 ? `
    <div class="info-row">
      <span class="info-label">Refunded:</span>
      <span>$${payment.refund_amount.toFixed(2)}</span>
    </div>
    ` : ""}
    <div class="info-row">
      <span class="info-label">Payment Method:</span>
      <span>${payment.payment_method || "Card"}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for using HITS (Hire I.T. Specialists)</p>
    <p>This is an automated invoice. For questions, please contact support.</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="invoice-${payment.id}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

