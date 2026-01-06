import React, { useState } from 'react'
import { MockApiService } from '../services/mockApiService'

export default function StatusPage() {
  const [id, setId] = useState('')
  const [result, setResult] = useState<any>(null)

  async function check(e: React.FormEvent) {
    e.preventDefault()
    const res = await MockApiService.getById(id)
    setResult(res || { error: 'Not found' })
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
        <h2 className="text-2xl sm:text-3xl font-bold">Check Submission Status</h2>
        <p className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base">Track your blog submission progress</p>
      </div>
      <form onSubmit={check} className="flex flex-col gap-3 sm:gap-2 mb-4 sm:mb-6 sm:flex-row">
        <input 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          placeholder="Enter reference ID" 
          className="flex-1 p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all" 
        />
        <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm sm:text-base font-bold rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all shadow-md hover:shadow-lg">Check</button>
      </form>
      <div className="mt-3 sm:mt-4">
        {result ? (
          result.error ? (
            <div className="p-4 sm:p-6 bg-danger-50 border-2 border-danger-300 rounded-lg text-danger-800 font-semibold text-center text-sm sm:text-base">
              {result.error}
            </div>
          ) : (
            <div className={`p-4 sm:p-6 rounded-lg border-2 ${
              result.status === 'approved' ? 'bg-success-50 border-success-300' :
              result.status === 'rejected' ? 'bg-danger-50 border-danger-300' :
              'bg-warning-50 border-warning-300'
            }`}>
              <div className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                  result.status === 'approved' ? 'bg-success-200 text-success-900' :
                  result.status === 'rejected' ? 'bg-danger-200 text-danger-900' :
                  'bg-warning-200 text-warning-900'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <pre className="text-xs sm:text-sm text-gray-700 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )
        ) : (
          <div className="p-4 sm:p-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-600 text-center font-medium text-sm sm:text-base">
            Enter a reference ID to check your submission status
          </div>
        )}
      </div>
    </div>
  )
}
