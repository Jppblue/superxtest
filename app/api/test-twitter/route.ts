import { searchTweets } from '@/lib/twitter';
import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const tweets = await searchTweets(query);
    console.log('Tweets received:', tweets);
    
    if (!tweets || !Array.isArray(tweets.data)) {
      throw new Error('Invalid response from Twitter API');
    }

    return NextResponse.json({
      success: true,
      data: tweets.data
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    
    const apiError = error as ApiError;
    
    if (apiError.code === 429) {
      return NextResponse.json(
        { success: false, error: 'Rate limit reached', code: 429 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: apiError.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 