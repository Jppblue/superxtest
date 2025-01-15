import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './openai'

interface TweetWithSimilarity {
  id: string;
  text: string;
  author_id: string;
  similarity?: number;
}

interface SimilarityGroup {
  [key: number]: TweetWithSimilarity[];
}

interface MatchTweetsParams {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey) 

export const findSimilarTweets = async (query: string): Promise<TweetWithSimilarity[]> => {
  try {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_tweets', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10
    }) as { data: TweetWithSimilarity[] | null, error: Error | null };

    if (error) throw error;
    if (!data) return [];

    // Agrupar tweets por similitud
    const groups = data.reduce((acc: SimilarityGroup, tweet: TweetWithSimilarity) => {
      const similarityGroup = Math.floor((tweet.similarity ?? 0) * 10) / 10;
      if (!acc[similarityGroup]) acc[similarityGroup] = [];
      acc[similarityGroup].push(tweet);
      return acc;
    }, {} as SimilarityGroup);

    // Ordenar por grupos de similitud
    return Object.values(groups).flat();
  } catch (error: unknown) {
    console.error('Error finding similar tweets:', error);
    throw error;
  }
}; 