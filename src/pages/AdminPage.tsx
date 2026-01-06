import React, { useEffect, useState } from 'react'
import { MockApiService } from '../services/mockApiService'
import { BlogSubmission } from '../types'

export default function AdminPage() {
  const [list, setList] = useState<BlogSubmission[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; title: string } | null>(null)

  useEffect(() => {
    MockApiService.adminListAll().then(setList)
  }, [])

  async function setStatus(id: string, status: BlogSubmission['status']) {
    setLoadingId(id)
    try {
      await MockApiService.adminUpdateStatus(id, status)
      setList(await MockApiService.adminListAll())
      const statusText = status === 'approved' ? 'Approved' : 'Rejected'
      setToast({
        message: `Blog submission has been ${status} successfully`,
        type: 'success',
        title: `✓ ${statusText}!`
      })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Error updating status:', err)
      setToast({
        message: 'Failed to update submission status',
        type: 'error',
        title: '✕ Error'
      })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoadingId(null)
    }
  }

  const getStatusBadge = (status: BlogSubmission['status']) => {
    const badges = {
      pending: 'bg-warning-100 text-warning-800 border border-warning-300',
      approved: 'bg-success-100 text-success-800 border border-success-300',
      rejected: 'bg-danger-100 text-danger-800 border border-danger-300',
    }
    return badges[status]
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-lg text-white">
        <h2 className="text-2xl sm:text-3xl font-bold">Admin — Review Submissions</h2>
        <p className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base">Manage and approve blog submissions</p>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 sm:top-4 sm:bottom-auto sm:right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 flex gap-2 sm:gap-3 min-w-64 sm:min-w-80 ${
            toast.type === 'success' 
              ? 'bg-success-50 border border-success-300' 
              : 'bg-danger-50 border border-danger-300'
          }`}>
            <div className={`text-lg sm:text-xl font-bold flex-shrink-0 ${
              toast.type === 'success' 
                ? 'text-success-600' 
                : 'text-danger-600'
            }`}>
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-sm sm:text-base ${
                toast.type === 'success' 
                  ? 'text-success-900' 
                  : 'text-danger-900'
              }`}>
                {toast.title}
              </h3>
              <p className={`text-xs sm:text-sm ${
                toast.type === 'success' 
                  ? 'text-success-700' 
                  : 'text-danger-700'
              }`}>
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3 sm:space-y-4">
        {list.map((b) => (
          <div key={b.id} className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words">{b.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{b.author} · {new Date(b.createdAt).toLocaleString()}</p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${getStatusBadge(b.status)}`}>
                {b.status}
              </span>
            </div>
            <div className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">{b.content}</div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setStatus(b.id, 'approved')} 
                disabled={loadingId === b.id}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-success-500 to-green-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex-1 sm:flex-none ${
                  loadingId === b.id ? 'opacity-75 cursor-not-allowed' : 'hover:from-success-600 hover:to-green-600'
                }`}
              >
                {loadingId === b.id ? '⏳ Processing...' : '✓ Approve'}
              </button>
              <button 
                onClick={() => setStatus(b.id, 'rejected')} 
                disabled={loadingId === b.id}
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-danger-500 to-red-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex-1 sm:flex-none ${
                  loadingId === b.id ? 'opacity-75 cursor-not-allowed' : 'hover:from-danger-600 hover:to-red-600'
                }`}
              >
                {loadingId === b.id ? '⏳ Processing...' : '✕ Reject'}
              </button>
            </div>
            {b.adminNote && <div className="mt-3 p-2 sm:p-3 bg-blue-50 border-l-4 border-primary-500 text-xs sm:text-sm text-gray-700">Note: {b.adminNote}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
