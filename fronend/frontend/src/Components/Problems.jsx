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
  // eslint-disable-next-line no-unused-vars
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
    if (!token) { 
        navigate('/login'); 
        return; 
    }

    const getUserIdFromToken = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.userId
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return null
      }
    }

    const fetchProblems = async () => {
      try {
        setLoading(true)
        setError(null)
        const userId = getUserIdFromToken()

        const [problemsRes, recentRes] = await Promise.allSettled([
          api.get('api/problems'), 
          userId ? api.get(`/profile/${userId}/recent`) : Promise.reject("No User ID")
        ])

        const problemsData = problemsRes.status === 'fulfilled' ? problemsRes.value.data : []
        
        const solvedIds = new Set()
        if (recentRes.status === 'fulfilled' && recentRes.value.data) {
            recentRes.value.data
                .filter(r => r.status === 'ACCEPTED')
                .forEach(r => solvedIds.add(r.problemId))
        }

        const formatted = problemsData.map(p => ({
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

  // UPDATED: Midnight/Gold palette
  const getDifficultyColor = level => {
    switch (level) {
      case 'Easy':   return { bg: 'from-emerald-600 to-emerald-800', text: 'text-emerald-100', glow: 'shadow-emerald-900/50' }
      case 'Medium': return { bg: 'from-amber-500 to-amber-700', text: 'text-amber-100', glow: 'shadow-amber-900/50' }
      case 'Hard':   return { bg: 'from-rose-600 to-rose-800', text: 'text-rose-100', glow: 'shadow-rose-900/50' }
      default:       return { bg: 'from-slate-600 to-slate-800', text: 'text-slate-100', glow: 'shadow-slate-900/50' }
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-amber-100/70">Syncing Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] flex items-center justify-center">
        <div className="bg-rose-900/20 border border-rose-500/30 rounded-2xl p-6 backdrop-blur-xl text-center">
          <p className="text-rose-100 mb-4">Error: {error.message}</p>
          <button onClick={() => window.location.reload()} className="text-xs bg-rose-600 text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e293b,_transparent)] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col h-full">

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Code className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Coding Master</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Problem Solving Suite
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/Account')}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl shadow-lg hover:border-amber-500/50 transition-all active:scale-95"
          >
            <User size={18} className="text-slate-300" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[ {icon: Target, label: 'Total', val: stats.total, color: 'text-slate-100'},
             {icon: CheckCircle2, label: 'Solved', val: stats.solved, color: 'text-emerald-400'},
             {icon: Zap, label: 'Easy', val: stats.easy, color: 'text-emerald-400'},
             {icon: Zap, label: 'Medium', val: stats.medium, color: 'text-amber-400'},
             {icon: Trophy, label: 'Hard', val: stats.hard, color: 'text-rose-400'} ].map((s, i) => (
            <div key={i} className="bg-[#151924] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#151924] border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/50">
              <option value="All">Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/50">
              {uniqueTopics.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
            </select>
            <select value={solvedFilter} onChange={e => setSolvedFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/50">
              <option value="All">Status</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Target className="w-12 h-12 text-slate-800" />
              <p className="text-slate-600 text-sm">No results match</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
              {filteredProblems.map(p => {
                const { bg, text, glow } = getDifficultyColor(p.difficulty)
                return (
                  <div key={p.id} onClick={() => navigate('/home', { state: p })} className="group bg-[#151924] border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {p.solved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-700" />}
                        <h2 className="text-lg font-bold text-slate-200">{p.title}</h2>
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${bg} ${text} text-xs font-medium shadow-lg ${glow}`}>
                        {p.difficulty}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.topics?.slice(0, 2).map((t, idx) => <span key={idx} className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">{t}</span>)}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
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
      `}</style>
    </div>
  )
}