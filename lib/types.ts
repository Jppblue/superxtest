export interface Tweet {
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
  similarity?: number;
}

export interface TweetData {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  embedding: number[];
  similarity?: number;
}

export interface ApiError {
  message: string;
  code?: number;
  status?: number;
} 