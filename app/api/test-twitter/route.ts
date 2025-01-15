import { searchTweets } from '@/lib/twitter';
import { saveTweetWithEmbedding } from '@/lib/tweets';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
    quote_count: number;
  };
}

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

    console.log('Attempting search with query:', query);
    const tweets = await searchTweets(query);
    console.log('Search successful');

    return NextResponse.json({
      success: true,
      data: tweets
    });
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.code === 401) {
      return NextResponse.json(
        { success: false, error: 'Twitter authentication failed. Please check API credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 