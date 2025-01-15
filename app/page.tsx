'use client'

import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ResultsSection from './components/ResultsSection'

export default function Home() {
  const [tweets, setTweets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/test-twitter?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw { 
          message: data.error,
          code: response.status
        };
      }

      if (data.success && Array.isArray(data.data)) {
        setTweets(data.data)
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
          Find relevant tweets for inspiration
        </p>
      </header>
      <SearchBar onSearch={handleSearch} loading={loading} />
      <ResultsSection
        tweets={tweets}
        loading={loading}
        error={error}
      />
    </main>
  )
}
