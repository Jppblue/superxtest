import { motion } from 'framer-motion'
import { Heart, MessageCircle, Repeat } from 'lucide-react'
import { Tweet } from '@/lib/types'

interface TweetCardProps extends Tweet {
  similarity?: number;
}

export default function TweetCard({ text, created_at, author_id, public_metrics, similarity }: TweetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
    >
      <p className="text-sm mb-2">{text}</p>
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{author_id}</span>
        <span>{new Date(created_at).toLocaleDateString()}</span>
      </div>
      
      {/* Métricas */}
      {public_metrics && (
        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Heart size={14} />
            <span>{public_metrics.like_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span>{public_metrics.reply_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat size={14} />
            <span>{public_metrics.retweet_count || 0}</span>
          </div>
        </div>
      )}

      {similarity !== undefined && (
        <div className="mt-2 text-xs text-blue-500">
          Similarity: {(similarity * 100).toFixed(1)}%
        </div>
      )}
    </motion.div>
  )
}
