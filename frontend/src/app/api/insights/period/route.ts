import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// GET /api/insights/period?period=YYYY-MM - Get or generate insight for a specific period
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');

    const url = period 
      ? `${API_URL}/api/insights/period?period=${period}`
      : `${API_URL}/api/insights/period`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Check if insights feature is unavailable (404 means routes not registered)
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'Insights feature is currently unavailable. OpenAI integration may not be configured.',
            feature_unavailable: true 
          }, 
          { status: 503 }
        );
      }
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching insight for period:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight for period' },
      { status: 500 }
    );
  }
}



