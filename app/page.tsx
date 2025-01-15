'use client'

import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ResultsSection from './components/ResultsSection'

export default function Home() {
  const [recentTweets, setRecentTweets] = useState<any[]>([])
  const [similarTweets, setSimilarTweets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const recentResponse = await fetch(`/api/test-twitter?q=${encodeURIComponent(query)}`)
      const recentData = await recentResponse.json()
      
      if (!recentResponse.ok) {
        throw { 
          message: recentData.error,
          code: recentResponse.status
        };
      }

      if (recentData.success && Array.isArray(recentData.data)) {
        setRecentTweets(recentData.data)
        
        const similarResponse = await fetch(`/api/semantic-search?q=${encodeURIComponent(query)}`)
        const similarData = await similarResponse.json()
        
        if (similarData.success && Array.isArray(similarData.data)) {
          setSimilarTweets(similarData.data)
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: any) {
      setError(err.message)
      throw err;
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Tweet Search</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Find relevant tweets and discover similar content
        </p>
      </header>
      <SearchBar onSearch={handleSearch} loading={loading} />
      <ResultsSection
        recentTweets={recentTweets}
        similarTweets={similarTweets}
        loading={loading}
        error={error}
      />
    </main>
  )
}
