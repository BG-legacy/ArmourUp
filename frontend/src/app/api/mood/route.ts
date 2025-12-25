import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// GET /api/mood - Get all mood entries for the current user
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Build query string for different types of requests
    let endpoint = `${API_BASE}/mood`;
    if (searchParams.has('start_date') && searchParams.has('end_date')) {
      endpoint += `/range?start_date=${searchParams.get('start_date')}&end_date=${searchParams.get('end_date')}`;
    } else if (searchParams.has('recent')) {
      const limit = searchParams.get('limit') || '7';
      endpoint += `/recent?limit=${limit}`;
    } else if (searchParams.has('trends')) {
      const days = searchParams.get('days') || '30';
      endpoint += `/trends?days=${days}`;
    } else if (searchParams.has('today')) {
      endpoint += '/today';
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    );
  }
}

// POST /api/mood - Create a new mood entry
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${API_BASE}/mood`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return NextResponse.json(
      { error: 'Failed to create mood entry' },
      { status: 500 }
    );
  }
}

