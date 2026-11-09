import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { website_honey } = body;

    // 1. Anti-spam honeypot detection
    if (website_honey && website_honey.trim() !== "") {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "Online enquiry submission is currently unavailable.",
        },
        { status: 503 }
      );
    }

    // 2. Accurately report that automated online submission is not yet available
    return NextResponse.json(
      {
        success: false,
        available: false,
        message:
          "Online enquiry submission is not yet available. Please contact our admissions desk directly at 9554960408 / 9554960415, email principaldvp@gmail.com, or visit the school admissions counter at Chilkahar, Ballia.",
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request format.",
      },
      { status: 400 }
    );
  }
}
