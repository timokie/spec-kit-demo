import React, { useState } from 'react'
import { MockApiService } from '../services/mockApiService'

export default function SubmitPage() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      const r = await MockApiService.submit({ title, author, content })
      setMsg(`Submitted — reference id ${r.id}`)
      setTitle('')
      setAuthor('')
      setContent('')
    } catch (err) {
      setMsg('Submission failed')
    }
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-primary-500 rounded-lg text-white">
        <h2 className="text-2xl sm:text-3xl font-bold">Submit a Blog</h2>
        <p className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base">Share your thoughts with our community</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="block w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Author (optional)</label>
            <input 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              className="block w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Content</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={6} 
            className="block w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
            required 
          />
        </div>
        <div>
          <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm sm:text-base font-bold rounded-lg hover:from-primary-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">Submit</button>
        </div>
        {msg && (
          <div className={`mt-4 p-4 rounded-lg ${msg.includes('Submitted') ? 'bg-success-100 text-success-800 border border-success-300' : 'bg-danger-100 text-danger-800 border border-danger-300'}`}>
            {msg}
          </div>
        )}
      </form>
    </div>
  )
}
