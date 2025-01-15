import { TwitterApi, TweetV2, TwitterApiReadOnly } from 'twitter-api-v2';

// Cache simple para evitar demasiadas peticiones
const CACHE: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos (duración del caché igual al rate limit)
const MIN_CACHE_INTERVAL = 15 * 60 * 1000; // 15 minutos entre búsquedas

// Control de rate limit
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS = 15; // Límite conservador

let lastSearchTime = 0;

export const getTwitterClient = () => {
  const token = process.env.TWITTER_BEARER_TOKEN;
  console.log('Environment variables:', {
    hasBearerToken: !!process.env.TWITTER_BEARER_TOKEN,
    tokenLength: token?.length
  });
  
  if (!token) {
    throw new Error('Twitter bearer token not configured');
  }
  
  console.log('Using token:', token.substring(0, 10) + '...');
  return new TwitterApi(token).readOnly;
};

export const searchTweets = async (query: string) => {
  try {
    const now = Date.now();
    
    // Siempre intentar usar caché primero
    const cacheKey = `search:${query}`;
    const cached = CACHE[cacheKey];
    if (cached) {
      const cacheAge = now - cached.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('Returning cached data for:', query);
        return cached.data;
      }
    }

    // Si no hay caché y la última búsqueda fue hace menos de 15 minutos
    if (lastSearchTime && (now - lastSearchTime < MIN_CACHE_INTERVAL)) {
      throw new Error(`Please wait ${Math.ceil((MIN_CACHE_INTERVAL - (now - lastSearchTime))/60000)} minutes before searching again`);
    }

    lastSearchTime = now;
    const client = getTwitterClient();
    
    console.log('Making Twitter API request for:', query);
    const response = await client.v2.search({
      query: query,
      max_results: 5,
      'tweet.fields': ['author_id', 'created_at', 'text', 'public_metrics'],
      expansions: ['author_id'],
    });

    console.log('Full Twitter response:', JSON.stringify(response, null, 2));

    // Asegurarnos de que tenemos un array de tweets
    const tweets: TweetV2[] = Array.isArray(response.data) ? response.data : [];
    console.log('Raw tweets:', tweets);

    // Formatear los tweets con el tipo correcto
    const formattedTweets = tweets.map((tweet: TweetV2) => ({
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id,
      created_at: tweet.created_at || new Date().toISOString(),
      public_metrics: tweet.public_metrics || {
        like_count: 0,
        reply_count: 0,
        retweet_count: 0,
        quote_count: 0
      }
    }));

    console.log('Formatted tweets:', formattedTweets);

    // Guardar en caché los tweets formateados
    CACHE[cacheKey] = {
      data: formattedTweets,
      timestamp: now
    };

    return formattedTweets;
  } catch (error: any) {
    // Si hay error pero tenemos caché, usarla aunque esté vencida
    const cached = CACHE[`search:${query}`];
    if (cached) {
      console.log('Error occurred, using cached data');
      return cached.data;
    }
    throw error;
  }
}; 