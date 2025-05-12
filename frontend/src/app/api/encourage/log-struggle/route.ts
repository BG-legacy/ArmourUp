import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Log struggle request body:", body);
    
    // Get token from headers or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || (await cookies()).get('accessToken')?.value;
    console.log("Token available:", !!token);
    
    if (!token) {
      console.log("No authorization token provided");
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Ensure we have struggle and message
    if (!body.struggle || !body.message) {
      console.log("Missing struggle or message in request");
      return NextResponse.json(
        { error: 'Struggle and message are required' },
        { status: 400 }
      );
    }

    // Combine struggle and message - making sure the format is consistent
    const updatedBody = {
      ...body,
      message: `Struggle: ${body.struggle.trim()}\nEncouragement: ${body.message.trim()}`
    };
    
    console.log("Sending to backend:", updatedBody);
    
    // Make request to backend API
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/encourage/log-struggle`;
    console.log("Calling backend URL:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedBody),
    });
    
    const responseText = await response.text();
    console.log("Backend response status:", response.status);
    console.log("Backend response text:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.log("Backend returned error:", data);
      return NextResponse.json(
        { error: data.error || 'Failed to log struggle' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Log struggle API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 