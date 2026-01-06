import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SubmitPage from './pages/SubmitPage'
import StatusPage from './pages/StatusPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-primary-600 via-accent-600 to-purple-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-white">✨ Blog Aggregator</h1>
          <nav className="space-x-1 flex flex-wrap">
            <Link to="/" className="text-white/90 hover:text-white px-2 sm:px-4 py-2 rounded-lg transition-all hover:bg-white/20 font-medium text-sm sm:text-base">Home</Link>
            <Link to="/submit" className="text-white/90 hover:text-white px-2 sm:px-4 py-2 rounded-lg transition-all hover:bg-white/20 font-medium text-sm sm:text-base">Submit</Link>
            <Link to="/status" className="text-white/90 hover:text-white px-2 sm:px-4 py-2 rounded-lg transition-all hover:bg-white/20 font-medium text-sm sm:text-base">Status</Link>
            <Link to="/admin" className="text-white/90 hover:text-white px-2 sm:px-4 py-2 rounded-lg transition-all hover:bg-white/20 font-medium text-sm sm:text-base">Admin</Link>
          </nav>
        </div>
      </header>
      <main className={`container mx-auto px-3 sm:px-4 py-4 sm:py-8 transition-all duration-300 transform ${isTransitioning ? 'translate-x-8 opacity-50' : 'translate-x-0 opacity-100'}`}>
        <Routes key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  )
}
