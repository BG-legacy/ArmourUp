import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    const response = await fetch(`${BACKEND_URL}/api/prayer/my-prayers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching prayer history:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer history" },
      { status: 500 }
    );
  }
}



