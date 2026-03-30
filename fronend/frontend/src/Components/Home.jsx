import React, { useState, useEffect, useRef } from 'react'
import {
  Play, Target, ArrowUp, Loader2, Code2, Terminal,
  CheckCircle2, XCircle, Sparkles, FlaskConical, Award
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import api from '../api/api'

export default function HomePage() {
  const location = useLocation()
  const problem = location.state

  const [language, setLanguage] = useState('java')
  const [code, setCode] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [leftWidth, setLeftWidth] = useState(40)
  const [isDragging, setIsDragging] = useState(false)
  const [resultsHeight, setResultsHeight] = useState(35)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [activeLeftTab, setActiveLeftTab] = useState('description')
  const [submissionResults, setSubmissionResults] = useState(null)
  const [showFlowers, setShowFlowers] = useState(false)

  const containerRef = useRef(null)
  const rightPanelRef = useRef(null)

  useEffect(() => {
    const fetchBoilerplate = async () => {
      try {
        const res = await api.get(`/api/problems/${problem.id}/boilerplate/${language}`)
        setCode(res.data)
      } catch {
        setCode('// Failed to load boilerplate')
      }
    }
    fetchBoilerplate()
  }, [language, problem.id])

  useEffect(() => {
    const handleMove = (e) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const w = ((e.clientX - rect.left) / rect.width) * 100
        if (w > 20 && w < 80) setLeftWidth(w)
      }
      if (isDraggingVertical && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect()
        const h = ((rect.bottom - e.clientY) / rect.height) * 100
        if (h > 15 && h < 70) setResultsHeight(h)
      }
    }
    const stop = () => { setIsDragging(false); setIsDraggingVertical(false) }
    if (isDragging || isDraggingVertical) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', stop)
    }
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', stop)
    }
  }, [isDragging, isDraggingVertical])

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId
  }

  const handleRunTests = async () => {
    if (!problem?.id) { alert("Problem ID missing."); return }
    setIsRunning(true)
    try {
      const res = await api.post('/api/run', { problemId: problem.id, language, code, showDiff: true })
      setTestResults(res.data)
    } catch {
      setTestResults('ERROR contacting judge')
    }
    setIsRunning(false)
  }

  const handleSubmit = async () => {
    setIsRunning(true)
    setShowFlowers(false)
    const userId = getUserIdFromToken()
    if (!userId) {
      setSubmissionResults('USER_NOT_LOGGED_IN')
      setActiveLeftTab('results')
      setIsRunning(false)
      return
    }
    try {
      const res = await api.post('/api/submit', { userId, problemId: problem.id, language, code })
      setSubmissionResults(res.data)
      setActiveLeftTab('results')
      if (res.data === 'ALL_TESTS_PASSED') {
        setShowFlowers(true)
        setTimeout(() => setShowFlowers(false), 5000)
      }
    } catch {
      setSubmissionResults('ERROR contacting judge')
      setActiveLeftTab('results')
    }
    setIsRunning(false)
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode('')
    setTestResults(null)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-700/10 via-transparent to-transparent pointer-events-none"></div>

      {showFlowers && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flower absolute animate-float"
              style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${3 + Math.random() * 2}s` }}>
              🌸
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Coding Master</h1>
            <p className="text-xs text-purple-300/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Solve & Conquer
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
            {['java', 'cpp'].map(lang => (
              <button key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                  language === lang
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-200/60 hover:text-white hover:bg-white/5'
                }`}>
                {lang === 'java' ? 'Java' : 'C++'}
              </button>
            ))}
          </div>

          <button onClick={handleRunTests} disabled={isRunning}
            className="group relative overflow-hidden bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 rounded-lg flex gap-2 items-center font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run</span>
          </button>

          <button onClick={handleSubmit} disabled={isRunning}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg flex gap-2 items-center font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95">
            <ArrowUp className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <div ref={containerRef} className="flex-1 flex relative overflow-hidden min-h-0">

        {/* Left Panel */}
        <div className="flex flex-col bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-0"
          style={{ width: `${leftWidth}%` }}>
          <div className="flex border-b border-white/10 bg-white/5 flex-shrink-0">
            {[
              { id: 'description', icon: Target, label: 'Description' },
              { id: 'results', icon: FlaskConical, label: 'Test Results' }
            // eslint-disable-next-line no-unused-vars
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveLeftTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 relative ${
                  activeLeftTab === id
                    ? 'text-white border-b-2 border-purple-400 bg-white/5'
                    : 'text-purple-200/60 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
                {id === 'results' && submissionResults === 'ALL_TESTS_PASSED' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {activeLeftTab === 'description' ? (
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {problem.title}
                  </h2>
                </div>
                <p className="text-purple-100/80 whitespace-pre-wrap leading-relaxed text-sm">
                  {problem.description}
                </p>
              </div>
            ) : (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Submission Results
                  </h2>
                </div>
                {submissionResults ? (
                  <>
                    {submissionResults === 'ALL_TESTS_PASSED' ? (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                          <h3 className="text-xl font-bold text-green-300">Perfect Score! 🎉</h3>
                        </div>
                        <p className="text-green-200/80 text-sm">All hidden test cases passed!</p>
                      </div>
                    ) : submissionResults.includes('ERROR') ? (
                      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <XCircle className="w-8 h-8 text-red-400" />
                          <h3 className="text-xl font-bold text-red-300">Submission Error</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <XCircle className="w-8 h-8 text-yellow-400" />
                          <h3 className="text-xl font-bold text-yellow-300">Some Tests Failed</h3>
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Detailed Output
                      </h4>
                      <pre className="whitespace-pre-wrap font-mono text-xs text-purple-100/90 leading-relaxed">
                        {submissionResults}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FlaskConical className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
                    <p className="text-purple-200/60 text-sm">No submission results yet</p>
                    <p className="text-purple-200/40 text-xs mt-1">Click Submit to run hidden test cases</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="absolute top-0 bottom-0 w-1 cursor-col-resize bg-gradient-to-b from-purple-500/40 via-pink-500/40 to-purple-500/40 hover:w-1.5 transition-all group z-20"
          style={{ left: `${leftWidth}%` }}
          onMouseDown={() => setIsDragging(true)}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
        </div>

        {/* Right Panel */}
        <div ref={rightPanelRef} className="flex flex-col min-h-0" style={{ width: `${100 - leftWidth}%` }}>

          {/* Editor header */}
          <div className="flex-shrink-0 bg-slate-950/80 border-b border-white/10 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <Terminal className="w-3.5 h-3.5 text-purple-400/60" />
            <span className="text-xs font-medium text-purple-200/50">
              {language === 'java' ? 'Solution.java' : 'solution.cpp'}
            </span>
          </div>

          {/* Editor + Results in a flex column */}
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="bg-slate-950 p-5 font-mono text-sm focus:outline-none resize-none leading-6 min-h-0"
              style={{
                flex: testResults ? `0 0 ${100 - resultsHeight}%` : '1 1 auto',
                color: '#c4b5fd',
                caretColor: '#a78bfa',
              }}
              spellCheck="false"
            />

            {testResults && (
              <>
                <div className="flex-shrink-0 h-1 cursor-row-resize bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-purple-500/40 hover:h-1.5 transition-all group relative z-20"
                  onMouseDown={() => setIsDraggingVertical(true)}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
                </div>

                <div className="bg-slate-950/95 border-t border-white/10 flex flex-col min-h-0 overflow-hidden"
                  style={{ flex: `0 0 ${resultsHeight}%` }}>
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-medium text-purple-200/80">Sample Test Results</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-purple-100/90 leading-relaxed">
                      {testResults}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
        textarea { scrollbar-width: none; -ms-overflow-style: none; }
        textarea::-webkit-scrollbar { display: none; }
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; font-size: 2rem; }
      `}</style>
    </div>
  )
}