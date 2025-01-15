export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // En el cliente
    return '';
  }
  // En el servidor
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
} 