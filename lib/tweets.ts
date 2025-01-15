import { supabase } from './supabase';
import { generateEmbedding } from './openai';

interface CacheEntry {
  data: unknown[];
  timestamp: number;
}

interface TweetCache {
  [query: string]: CacheEntry;
}

export async function saveTweetWithEmbedding(tweet: Record<string, unknown>) {
  try {
    const embedding = await generateEmbedding(tweet.text as string);

    const { error } = await supabase.from('tweets').insert({
      id: tweet.id,
      content: tweet.text,
      author: tweet.author_id,
      embedding
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving tweet:', error);
    throw error;
  }
}

// Cache en memoria para tweets similares
const SIMILAR_CACHE: TweetCache = {};

export async function findSimilarTweets(query: string) {
  try {
    if (SIMILAR_CACHE[query]) {
      console.log('Using cached similar tweets');
      return SIMILAR_CACHE[query].data;
    }

    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_tweets', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (error) throw error;
    SIMILAR_CACHE[query] = {
      data,
      timestamp: Date.now()
    };
    return data;
  } catch (error) {
    console.error('Error finding similar tweets:', error);
    throw error;
  }
} 