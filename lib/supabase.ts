import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './openai'
import { Tweet } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey) 

interface SimilarityGroup {
  [key: number]: Tweet[];
}

export const findSimilarTweets = async (query: string) => {
  try {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_tweets', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10
    });

    if (error) throw error;

    // Agrupar tweets por similitud
    const groups = data.reduce((acc: SimilarityGroup, tweet: Tweet) => {
      const similarityGroup = Math.floor((tweet.similarity ?? 0) * 10) / 10;
      if (!acc[similarityGroup]) acc[similarityGroup] = [];
      acc[similarityGroup].push(tweet);
      return acc;
    }, {});

    // Ordenar por grupos de similitud
    return Object.values(groups).flat();
  } catch (error) {
    console.error('Error finding similar tweets:', error);
    throw error;
  }
}; 