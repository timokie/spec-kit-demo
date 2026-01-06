import React, { useEffect, useState } from 'react'
import { MockApiService } from '../services/mockApiService'
import { BlogSubmission } from '../types'

function BlogCard({ b }: { b: BlogSubmission }) {
  const gradients = [
    'from-blue-50 to-cyan-50 border-l-4 border-primary-500',
    'from-purple-50 to-pink-50 border-l-4 border-accent-500',
    'from-green-50 to-emerald-50 border-l-4 border-success-500',
    'from-orange-50 to-yellow-50 border-l-4 border-warning-500',
  ]
  const gradient = gradients[Math.abs(b.id.charCodeAt(0)) % gradients.length]
  
  return (
    <article className={`bg-gradient-to-br ${gradient} p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
      <h3 className="font-bold text-base sm:text-lg text-gray-900">{b.title}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{b.author} · {new Date(b.createdAt).toLocaleString()}</p>
      <div className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">{b.content}</div>
    </article>
  )
}

export default function HomePage() {
  const [posts, setPosts] = useState<BlogSubmission[]>([])

  useEffect(() => {
    MockApiService.listApproved().then(setPosts)
  }, [])

  return (
    <div>
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-primary-500 via-accent-500 to-pink-500 rounded-lg text-white">
        <h2 className="text-2xl sm:text-3xl font-bold">Latest Blogs</h2>
        <p className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base">Discover the latest blog submissions</p>
      </div>
      <div className="grid gap-3 sm:gap-4">
        {posts.length === 0 ? <div className="text-center p-6 sm:p-8 text-gray-500">No approved posts yet.</div> : posts.map((p) => <BlogCard key={p.id} b={p} />)}
      </div>
    </div>
  )
}
