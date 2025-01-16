import { TwitterApi } from 'twitter-api-v2';
import { generateEmbedding } from './openai';
import { supabase } from './supabase';

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
const roClient = client.readOnly;

async function saveTweetToSupabase(tweet: any) {
  try {
    const embedding = await generateEmbedding(tweet.text);
    
    await supabase.from('tweets').upsert({
      id: BigInt(tweet.id),
      content: tweet.text,
      author: tweet.author_id,
      embedding
    }, {
      onConflict: 'id'
    });
  } catch (error) {
    console.error('Error saving tweet:', error);
  }
}

export const searchTweets = async (query: string) => {
  try {
    const tweets = await roClient.v2.search({
      query,
      max_results: 50,
      'tweet.fields': ['author_id', 'created_at', 'text', 'public_metrics'],
    });
    
    // Guardar tweets en Supabase en paralelo
    await Promise.all(tweets.data.data.map(saveTweetToSupabase));
    
    return tweets.data;
  } catch (error) {
    console.error('Error searching tweets:', error);
    throw error;
  }
}; 