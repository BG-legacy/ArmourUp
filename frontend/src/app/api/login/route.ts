import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Make request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, return a generic error
      console.error('Failed to parse backend response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      // Return the error from backend, or a generic message
      return NextResponse.json(
        { error: data.error || 'Login failed' },
        { status: response.status }
      );
    }
    
    // Set the access token as an HTTP-only cookie
    const responseToSend = NextResponse.json(data);
    
    if (data.access_token) {
      responseToSend.cookies.set('token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }
    
    return responseToSend;
  } catch (error) {
    console.error('Login API route error:', error);
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to server. Please check if the backend is running.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 