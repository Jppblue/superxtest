import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// Crear un cliente de solo lectura
const roClient = client.readOnly;

export const searchTweets = async (query: string) => {
  try {
    const tweets = await roClient.v2.search({
      query,
      max_results: 10,
      'tweet.fields': ['author_id', 'created_at', 'text'],
    });
    
    return tweets.data;
  } catch (error) {
    console.error('Error searching tweets:', error);
    throw error;
  }
}; 