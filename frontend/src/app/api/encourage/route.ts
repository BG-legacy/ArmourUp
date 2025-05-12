import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Get token from headers or cookies
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || (await cookies()).get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Make request to backend API
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/encourage`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || 'Failed to fetch encouragements';
      } catch {
        errorMessage = 'Failed to fetch encouragements';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    console.error('Encouragements API route error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 