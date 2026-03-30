import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Code, Trophy, Target, Sparkles, Zap, Home, User, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import api from '../api/api'

export default function Problems() {
  const [allProblems, setAllProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [solvedFilter, setSolvedFilter] = useState('All')
  const [hoveredProblem, setHoveredProblem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    const getUserIdFromToken = () => {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId
    }

    const fetchProblems = async () => {
      try {
        setLoading(true)
        setError(null)

        const userId = getUserIdFromToken()

        const [problemsRes, recentRes] = await Promise.all([
          api.get('api/problems'),
          api.get(`/profile/${userId}/recent`)
        ])

        const solvedIds = new Set(
          recentRes.data
            .filter(r => r.status === 'ACCEPTED')
            .map(r => r.problemId)
        )

        const formatted = problemsRes.data.map(p => ({
          ...p,
          topics: Array.isArray(p.topics) ? p.topics : [],
          difficulty: p.difficulty
            ? p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1).toLowerCase()
            : 'Easy',
          solved: solvedIds.has(p.id)
        }))

        setAllProblems(formatted)
        setFilteredProblems(formatted)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [navigate])

  useEffect(() => {
    let filtered = allProblems

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.topics && p.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter)
    }

    if (topicFilter !== 'All') {
      filtered = filtered.filter(p => p.topics && p.topics.includes(topicFilter))
    }

    if (solvedFilter !== 'All') {
      filtered = filtered.filter(p => solvedFilter === 'Solved' ? p.solved : !p.solved)
    }

    setFilteredProblems(filtered)
  }, [allProblems, difficultyFilter, topicFilter, searchTerm, solvedFilter])

  const uniqueTopics = [
    'All',
    ...Array.from(new Set(allProblems.flatMap(p => Array.isArray(p.topics) ? p.topics : [])))
  ]

  const stats = {
    total: allProblems.length,
    solved: allProblems.filter(p => p.solved).length,
    easy: allProblems.filter(p => p.difficulty === 'Easy').length,
    medium: allProblems.filter(p => p.difficulty === 'Medium').length,
    hard: allProblems.filter(p => p.difficulty === 'Hard').length
  }

  const getDifficultyColor = level => {
    switch (level) {
      case 'Easy':   return { bg: 'from-emerald-500 to-teal-500',  text: 'text-white', glow: 'shadow-emerald-500/30' }
      case 'Medium': return { bg: 'from-amber-500 to-orange-500',  text: 'text-white', glow: 'shadow-amber-500/30' }
      case 'Hard':   return { bg: 'from-rose-500 to-pink-600',     text: 'text-white', glow: 'shadow-rose-500/30' }
      default:       return { bg: 'from-gray-400 to-gray-500',     text: 'text-white', glow: 'shadow-gray-500/30' }
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-purple-200">Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <p className="text-red-200">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col h-full">

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Coding Master
              </h1>
              <p className="text-xs text-purple-300/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Master the Art of Problem Solving
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/problems')}
              className="group relative overflow-hidden p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Home size={18} className="text-white relative z-10" />
            </button>
            <button
              onClick={() => navigate('/Account')}
              className="group relative overflow-hidden p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <User size={18} className="text-white relative z-10" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300/60">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300/60">Solved</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.solved}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-teal-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-300/60">Easy</span>
            </div>
            <p className="text-2xl font-bold text-teal-400">{stats.easy}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300/60">Medium</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.medium}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-rose-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-300/60">Hard</span>
            </div>
            <p className="text-2xl font-bold text-rose-400">{stats.hard}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all duration-300"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all duration-300"
            >
              {uniqueTopics.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
            </select>
            <select
              value={solvedFilter}
              onChange={e => setSolvedFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all duration-300"
            >
              <option value="All">All Status</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Target className="w-12 h-12 text-purple-400/40" />
              <p className="text-purple-200/60 text-sm">No problems found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
              {filteredProblems.map(p => {
                const { bg, text, glow } = getDifficultyColor(p.difficulty)
                return (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredProblem(p.id)}
                    onMouseLeave={() => setHoveredProblem(null)}
                    onClick={() => navigate('/home', { state: p })}
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          {p.solved
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            : <Circle className="w-4 h-4 text-purple-400/40 flex-shrink-0" />
                          }
                          <h2 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                            {p.title}
                          </h2>
                        </div>
                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${bg} ${text} text-xs font-medium shadow-lg ${glow} flex-shrink-0 ml-2`}>
                          {p.difficulty}
                        </div>
                      </div>
                      <p className="text-sm text-purple-100/70 mb-4 line-clamp-2 group-hover:text-purple-100/90 transition-colors">
                        {p.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {p.topics && p.topics.slice(0, 2).map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs">
                              {topic}
                            </span>
                          ))}
                          {p.topics && p.topics.length > 2 && (
                            <span className="text-xs text-purple-300/60">+{p.topics.length - 2}</span>
                          )}
                        </div>
                        <ArrowRight className={`w-4 h-4 text-purple-400 transition-all duration-300 ${
                          hoveredProblem === p.id ? 'translate-x-1 opacity-100' : 'opacity-0'
                        }`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  )
}