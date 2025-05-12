import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    // Get token from headers or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || cookies().get('accessToken')?.value;
    console.log("Token available:", !!token);
    
    if (!token) {
      console.log("No authorization token provided");
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Make request to backend API
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/ai/encourage`;
    console.log("Calling backend URL:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
        { error: data.error || 'Failed to get encouragement' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI encouragement API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 