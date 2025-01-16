import { searchTweets } from '@/lib/twitter';
import { findSimilarTweets } from '@/lib/tweets';
import { NextResponse } from 'next/server';
import { ApiError, Tweet, TweetData } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ErrorResponse {
  success: false;
  error: string;
  code?: number;
}

interface SuccessResponse {
  success: true;
  data: Tweet[];
}

type ApiResponse = ErrorResponse | SuccessResponse;

function convertToTweet(tweet: any): Tweet {
  return {
    id: tweet.id,
    text: tweet.text || tweet.content,
    author_id: tweet.author_id || tweet.author,
    created_at: tweet.created_at || new Date().toISOString(),
    public_metrics: tweet.public_metrics,
    similarity: tweet.similarity
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    let newTweets: Tweet[] = [];
    let twitterError = null;

    // 1. Intentar buscar tweets nuevos
    try {
      const response = await searchTweets(query);
      newTweets = response.data.map(convertToTweet);
    } catch (error: any) {
      console.error('Twitter API Error:', error);
      twitterError = error;
    }
    
    // 2. Buscar tweets similares en la base de datos (esto siempre se ejecuta)
    const similarTweets = await findSimilarTweets(query);
    const convertedSimilarTweets = similarTweets.map(convertToTweet);
    
    // 3. Combinar resultados (incluso si Twitter falló)
    const allTweets = [...newTweets, ...convertedSimilarTweets];
    const uniqueTweets = Array.from(new Map(allTweets.map(tweet => [tweet.id, tweet])).values());
    
    // 4. Si no hay tweets en absoluto, entonces sí lanzamos error
    if (uniqueTweets.length === 0 && twitterError) {
      throw twitterError;
    }

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      data: uniqueTweets
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const apiError = error as ApiError;
    return NextResponse.json<ApiResponse>(
      { 
        success: false, 
        error: apiError.message || 'Unknown error occurred',
        code: apiError.code 
      },
      { status: 500 }
    );
  }
} 