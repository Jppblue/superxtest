'use client'

import TweetCard from './TweetCard'
import { Tweet } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface ResultsSectionProps {
  recentTweets: Tweet[]
  loading: boolean
  error: string | null
}

export default function ResultsSection({ recentTweets, loading, error }: ResultsSectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Tweets</h2>
        {recentTweets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tweets found</p>
        ) : (
          recentTweets.map((tweet) => (
            <TweetCard key={tweet.id} {...tweet} />
          ))
        )}
      </div>
    </div>
  )
}

