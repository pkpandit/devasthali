import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, parentName, phone, grade, admissionType, city, website_honey } = body;

    // 1. Anti-spam honeypot detection
    if (website_honey && website_honey.trim() !== "") {
      console.warn("Spam bot detected via honeypot trap:", body);
      // Return 200 to trick bots into believing it succeeded
      return NextResponse.json({ success: true, message: "Enquiry recorded successfully." });
    }

    // 2. Server-side validation
    if (!studentName || !parentName || !phone || !grade) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: Name, Phone, and Class are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // 3. Storing / logging enquiry
    const leadRecord = {
      id: `ENQ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      phone: cleanPhone,
      grade,
      admissionType: admissionType || "Day-Scholar",
      city: city || "Ballia",
      status: "New",
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };

    console.log(">> New Admission Enquiry Received at Devasthaly Vidyapeeth:", leadRecord);

    return NextResponse.json({
      success: true,
      message: "Admission enquiry logged successfully. Our team will contact you shortly.",
      leadId: leadRecord.id,
    });
  } catch (error) {
    console.error("Error processing admission enquiry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred while logging enquiry." },
      { status: 500 }
    );
  }
}
