import { findSimilarTweets } from '@/lib/tweets';
import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const similarTweets = await findSimilarTweets(query);
    return NextResponse.json({ success: true, data: similarTweets });
  } catch (error: unknown) {
    console.error('Error:', error);
    const apiError = error as ApiError;
    return NextResponse.json(
      { success: false, error: apiError.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 