import { getBaseUrl } from './utils';

export async function generateEmbedding(text: string) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.embedding;
} 