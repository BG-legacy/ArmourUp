import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request or cookie
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('token')?.value;
    
    // Use token from Authorization header if available, otherwise use cookie
    const token = authHeader?.split(' ')[1] || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Prepare the authorization header
    const authHeaderToSend = authHeader || `Bearer ${token}`;
    
    // Make request to backend API
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/api/users/me`, {
      headers: {
        'Authorization': authHeaderToSend,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to get user data' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get current user API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 