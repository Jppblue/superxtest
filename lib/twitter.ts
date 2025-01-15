import { TwitterApi } from 'twitter-api-v2';

// Cache simple para evitar demasiadas peticiones
const CACHE: { [key: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
const MIN_CACHE_INTERVAL = 15 * 60 * 1000; // 15 minutos entre búsquedas

let lastSearchTime = 0;

export const getTwitterClient = () => {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    throw new Error('Twitter bearer token not configured');
  }
  return new TwitterApi(token).readOnly;
};

export const searchTweets = async (query: string) => {
  try {
    const now = Date.now();
    
    // Intentar usar caché
    const cacheKey = `search:${query}`;
    const cached = CACHE[cacheKey];
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log('Returning cached data for:', query);
      return cached.data;
    }

    // Verificar rate limit
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
    });

    // Guardar en caché y retornar
    CACHE[cacheKey] = {
      data: response.data,
      timestamp: now
    };

    return response.data;
  } catch (error: any) {
    // Si hay error pero tenemos caché, usarla
    const cached = CACHE[`search:${query}`];
    if (cached) {
      console.log('Error occurred, using cached data');
      return cached.data;
    }
    throw error;
  }
}; 