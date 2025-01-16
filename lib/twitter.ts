import { TwitterApi } from 'twitter-api-v2';
import { generateEmbedding } from './openai';
import { supabase } from './supabase';

interface TwitterRawTweet {
  id: string;
  text?: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
    quote_count: number;
  };
}

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
const roClient = client.readOnly;

async function saveTweetToSupabase(tweet: TwitterRawTweet) {
  try {
    if (!tweet.text || !tweet.author_id) {
      console.error('Tweet missing required fields:', tweet);
      return;
    }

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