'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading?: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [formattedTime, setFormattedTime] = useState('')

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1))
      }, 1000)

      // Formatear el tiempo restante
      const minutes = Math.floor(cooldown / 60)
      const seconds = cooldown % 60
      setFormattedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)

      return () => clearInterval(timer)
    }
  }, [cooldown])

  const handleSearch = async () => {
    try {
      await onSearch(query)
    } catch (error: any) {
      if (error.code === 429) {
        setCooldown(900) // 15 minutos en segundos
      }
    }
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder={cooldown > 0 ? `Try again in ${formattedTime}` : "Search tweets..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full px-4 py-2 rounded-full border focus:ring-2 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
          disabled={cooldown > 0 || loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || cooldown > 0}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full" />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>
      {cooldown > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Rate limit reached. Try again in {formattedTime}
        </p>
      )}
    </div>
  )
}
