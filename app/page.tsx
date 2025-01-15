'use client'

import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ResultsSection from './components/ResultsSection'
import { Tweet } from '@/lib/types'

export default function Home() {
  const [recentTweets, setRecentTweets] = useState<Tweet[]>([])
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
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message)
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
        loading={loading}
        error={error}
      />
    </main>
  )
}
