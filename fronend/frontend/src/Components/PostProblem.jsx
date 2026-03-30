///* eslint-disable no-unused-vars */
//import React, { useState } from 'react';
//import { Plus, Save, X, Code, Tag, AlertCircle, CheckCircle, Sparkles, Clock, Target } from 'lucide-react';
//
//export default function AddProblem() {
//  const [formData, setFormData] = useState({
//    title: '',
//    description: '',
//    topics: [],
//    timeSpent: '',
//    testCases: [],
//    hiddenCases: [],
//  });
//
//  const [newTopic, setNewTopic] = useState('');
//  const [loading, setLoading] = useState(false);
//  const [message, setMessage] = useState({ type: '', text: '' });
//  const [errors, setErrors] = useState({});
//
//  const commonTopics = [
//    'Array', 'String', 'Linked List', 'Binary Tree', 'Graph', 
//    'Dynamic Programming', 'Recursion', 'Sorting', 'Searching', 
//    'Hash Table', 'Stack', 'Queue', 'Heap', 'Two Pointers',
//    'Sliding Window', 'Backtracking', 'Greedy', 'Math', 'Bit Manipulation'
//  ];
//
//  const handleInputChange = (e) => {
//    const { name, value, type, checked } = e.target;
//    setFormData(prev => ({
//      ...prev,
//      [name]: type === 'checkbox' ? checked : value
//    }));
//    if (errors[name]) {
//      setErrors(prev => ({ ...prev, [name]: '' }));
//    }
//  };
//
//  const addTopic = (topic) => {
//    if (topic && !formData.topics.includes(topic)) {
//      setFormData(prev => ({
//        ...prev,
//        topics: [...prev.topics, topic]
//      }));
//      setNewTopic('');
//    }
//  };
//
//  const removeTopic = (topicToRemove) => {
//    setFormData(prev => ({
//      ...prev,
//      topics: prev.topics.filter(topic => topic !== topicToRemove)
//    }));
//  };
//
//  const validateForm = () => {
//    const newErrors = {};
//    if (!formData.title.trim()) newErrors.title = 'Title is required';
//    if (!formData.description.trim()) newErrors.description = 'Description is required';
//    if (formData.topics.length === 0) newErrors.topics = 'At least one topic is required';
//    setErrors(newErrors);
//    return Object.keys(newErrors).length === 0;
//  };
//
//  const handleSubmit = async (e) => {
//    e.preventDefault();
//    if (!validateForm()) {
//      setMessage({ type: 'error', text: 'Please fix the errors below' });
//      return;
//    }
//    setLoading(true);
//    setMessage({ type: '', text: '' });
//    try {
//      // Simulate API call
//      const response = await fetch('http://localhost:8080/PostProblem', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          'Authorization':`Bearer ${localStorage.getItem('token')}`
//        },
//        body: JSON.stringify({
//          ...formData,
//          timeSpent: formData.timeSpent || null
//        })
//      });
//      alert(formData.topics);
//      if (!response.ok) {
//        throw new Error('Failed to add problem');
//      }
//      setMessage({ type: 'success', text: 'Problem added successfully!' });
//      setFormData({
//        title: '',
//        description: '',
//        topics: [],
//        timeSpent: '',
//        testCases: [],
//        hiddenCases: [],
//      });
//    } catch (error) {
//      console.log(error);
//      setMessage({ type: 'error', text: 'Failed to add problem. Please try again.' });
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  return (
//    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
//      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
//      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)] animate-pulse delay-1000"></div>
//      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(75,0,130,0.2),transparent_50%)] animate-pulse delay-2000"></div>
//
//      <div className="relative z-10 min-h-screen flex flex-col">
//        <div className="flex-shrink-0 p-6 border-b border-white/10 backdrop-blur-sm">
//          <div className="max-w-7xl mx-auto">
//            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-4">
//              <Sparkles className="text-cyan-400" size={48} />
//              Add New Problem
//            </h1>
//            <p className="text-lg text-gray-300 mt-2">Create and track your coding challenges</p>
//          </div>
//        </div>
//
//        <div className="flex-1 p-6">
//          <div className="max-w-7xl mx-auto">
//            {message.text && (
//              <div className={`p-4 mb-6 rounded-2xl backdrop-blur-sm border ${
//                message.type === 'success' 
//                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' 
//                  : 'bg-red-500/20 border-red-500/30 text-red-200'
//              } flex items-center gap-3`}>
//                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//                {message.text}
//              </div>
//            )}
//
//            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//              <div className="lg:col-span-2 space-y-6">
//                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
//                  <div className="flex items-center gap-3 mb-4">
//                    <Code className="text-cyan-400" size={24} />
//                    <h2 className="text-2xl font-bold">Problem Details</h2>
//                  </div>
//                  
//                  <div className="space-y-4">
//                    <div>
//                      <label className="block text-sm font-semibold text-gray-300 mb-2">Problem Title</label>
//                      <input 
//                        type="text" 
//                        name="title" 
//                        value={formData.title} 
//                        onChange={handleInputChange}
//                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
//                        placeholder="Enter problem title..."
//                      />
//                      {errors.title && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.title}</p>}
//                    </div>
//
//                    <div>
//                      <label className="block text-sm font-semibold text-gray-300 mb-2">Problem Description</label>
//                      <textarea 
//                        name="description" 
//                        value={formData.description} 
//                        onChange={handleInputChange}
//                        rows={6} 
//                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
//                        placeholder="Describe the problem in detail..."
//                      />
//                      {errors.description && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.description}</p>}
//                    </div>
//                  </div>
//                </div>
//
//                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
//                  <div className="flex items-center gap-3 mb-4">
//                    <Tag className="text-purple-400" size={24} />
//                    <h2 className="text-2xl font-bold">Topics & Categories</h2>
//                  </div>
//                  
//                  <div className="space-y-4">
//                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                      {commonTopics.map(topic => (
//                        <button 
//                          key={topic} 
//                          type="button" 
//                          onClick={() => addTopic(topic)}
//                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
//                            formData.topics.includes(topic) 
//                              ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed' 
//                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
//                          }`}
//                          disabled={formData.topics.includes(topic)}
//                        >
//                          {topic}
//                        </button>
//                      ))}
//                    </div>
//                    
//                    {formData.topics.length > 0 && (
//                      <div className="flex flex-wrap gap-2 mt-4">
//                        {formData.topics.map(topic => (
//                          <span 
//                            key={topic} 
//                            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center gap-2 text-cyan-200"
//                          >
//                            {topic} 
//                            <button 
//                              type="button" 
//                              onClick={() => removeTopic(topic)}
//                              className="hover:text-red-400 transition-colors"
//                            >
//                              <X size={16} />
//                            </button>
//                          </span>
//                        ))}
//                      </div>
//                    )}
//                    {errors.topics && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.topics}</p>}
//                  </div>
//                </div>
//
//                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                  <TestCaseEditor
//                    label="Test Cases"
//                    cases={formData.testCases}
//                    setCases={(cases) => setFormData(prev => ({ ...prev, testCases: cases }))}
//                    icon={<Target className="text-green-400" size={24} />}
//                  />
//                  <TestCaseEditor
//                    label="Hidden Cases"
//                    cases={formData.hiddenCases}
//                    setCases={(cases) => setFormData(prev => ({ ...prev, hiddenCases: cases }))}
//                    icon={<Code className="text-orange-400" size={24} />}
//                  />
//                </div>
//              </div>
//
//              <div className="space-y-6">
//                <button 
//                  type="submit" 
//                  disabled={loading}
//                  onClick={handleSubmit}
//                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
//                >
//                  {loading ? (
//                    <div className="flex items-center justify-center gap-2">
//                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                      Submitting...
//                    </div>
//                  ) : (
//                    <div className="flex items-center justify-center gap-2">
//                      <Plus size={20} />
//                      Add Problem
//                    </div>
//                  )}
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//function TestCaseEditor({ label, cases, setCases, icon }) {
//  const addCase = () => setCases([...cases, { input: '', expected: '' }]);
//  const updateCase = (i, field, value) => {
//    const newCases = [...cases];
//    newCases[i][field] = value;
//    setCases(newCases);
//  };
//  const removeCase = (i) => setCases(cases.filter((_, index) => index !== i));
//
//  return (
//    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
//      <div className="flex items-center gap-3 mb-4">
//        {icon}
//        <h3 className="text-xl font-bold">{label}</h3>
//      </div>
//      
//      <div className="space-y-4 max-h-96 overflow-y-auto">
//        {cases.map((tc, i) => (
//          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
//            <div className="flex justify-between items-center">
//              <span className="text-sm font-semibold text-gray-300">Case {i + 1}</span>
//              <button 
//                onClick={() => removeCase(i)} 
//                type="button" 
//                className="text-red-400 hover:text-red-300 transition-colors"
//              >
//                <X size={16} />
//              </button>
//            </div>
//            
//            <div>
//              <label className="block text-xs text-gray-400 mb-1">Input:</label>
//              <textarea
//                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
//                value={tc.input}
//                onChange={(e) => updateCase(i, 'input', e.target.value)}
//                rows={2}
//                placeholder="Enter test input..."
//              />
//            </div>
//            
//            <div>
//              <label className="block text-xs text-gray-400 mb-1">Expected Output:</label>
//              <textarea
//                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
//                value={tc.expected}
//                onChange={(e) => updateCase(i, 'expected', e.target.value)}
//                rows={2}
//                placeholder="Enter expected output..."
//              />
//            </div>
//          </div>
//        ))}
//        
//        <button 
//          type="button" 
//          onClick={addCase} 
//          className="w-full py-3 border-2 border-dashed border-white/30 rounded-xl text-gray-300 hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
//        >
//          <Plus size={18} />
//          Add {label}
//        </button>
//      </div>
//    </div>
//  );
//}



/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Plus, X, Code, Tag, AlertCircle, CheckCircle, Sparkles, Target, Trash2 } from 'lucide-react';

export default function AddProblem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: [],
    timeSpent: '',
    testCases: [],
    hiddenCases: [],
    type: 'FUNCTION',
    function: {
      name: '',
      returnType: '',
      params: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const commonTopics = [
    'Array', 'String', 'Linked List', 'Binary Tree', 'Graph',
    'Dynamic Programming', 'Recursion', 'Sorting', 'Searching',
    'Hash Table', 'Stack', 'Queue', 'Heap', 'Two Pointers',
    'Sliding Window', 'Backtracking', 'Greedy', 'Math', 'Bit Manipulation'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFunctionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      function: { ...prev.function, [name]: value }
    }));
  };

  const addParam = () => {
    setFormData(prev => ({
      ...prev,
      function: {
        ...prev.function,
        params: [...prev.function.params, { name: '', type: '' }]
      }
    }));
  };

  const updateParam = (i, field, value) => {
    const params = [...formData.function.params];
    params[i][field] = value;
    setFormData(prev => ({
      ...prev,
      function: { ...prev.function, params }
    }));
  };

  const removeParam = (i) => {
    setFormData(prev => ({
      ...prev,
      function: {
        ...prev.function,
        params: prev.function.params.filter((_, idx) => idx !== i)
      }
    }));
  };

  const addTopic = (topic) => {
    if (!formData.topics.includes(topic)) {
      setFormData(prev => ({ ...prev, topics: [...prev.topics, topic] }));
    }
  };

  const removeTopic = (topic) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:8080/PostProblem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error();

      setMessage({ type: 'success', text: 'Problem added successfully!' });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          topics: [],
          timeSpent: '',
          testCases: [],
          hiddenCases: [],
          type: 'FUNCTION',
          function: {
            name: '',
            returnType: '',
            params: []
          }
        });
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to add problem. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold flex items-center gap-4 mb-2">
            <Sparkles className="text-yellow-400" size={48} />
            Add New Problem
          </h1>
          <p className="text-slate-300 text-lg ml-16">Create a new coding challenge for your platform</p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' 
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Problem Details Card */}
            <Card title="Problem Details" icon={<Code className="text-cyan-400" />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Problem Title *
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Two Sum"
                    required
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Problem Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    placeholder="Provide a clear description of the problem, including constraints and examples..."
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time Spent (optional)
                  </label>
                  <input
                    name="timeSpent"
                    value={formData.timeSpent}
                    onChange={handleInputChange}
                    placeholder="e.g., 30 minutes"
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            </Card>

            {/* Function Definition Card */}
            <Card title="Function Definition" icon={<Code className="text-purple-400" />}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Function Name *
                    </label>
                    <input
                      name="name"
                      value={formData.function.name}
                      onChange={handleFunctionChange}
                      placeholder="e.g., twoSum"
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Return Type *
                    </label>
                    <input
                      name="returnType"
                      value={formData.function.returnType}
                      onChange={handleFunctionChange}
                      placeholder="e.g., int[]"
                      required
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Parameters
                  </label>
                  <div className="space-y-2">
                    {formData.function.params.map((p, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input
                          value={p.name}
                          onChange={e => updateParam(i, 'name', e.target.value)}
                          placeholder="Parameter name"
                          className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                        />
                        <input
                          value={p.type}
                          onChange={e => updateParam(i, 'type', e.target.value)}
                          placeholder="Type"
                          className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeParam(i)}
                          className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all"
                        >
                          <Trash2 size={20} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={addParam}
                    className="w-full mt-3 py-3 border-2 border-dashed border-white/30 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-white"
                  >
                    <Plus size={20} />
                    Add Parameter
                  </button>
                </div>
              </div>
            </Card>

            {/* Topics Card */}
            <Card title="Topics & Tags" icon={<Tag className="text-pink-400" />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select relevant topics
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonTopics.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => addTopic(t)}
                        disabled={formData.topics.includes(t)}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all text-sm font-medium"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.topics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Selected Topics ({formData.topics.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.topics.map(t => (
                        <span
                          key={t}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex gap-2 items-center text-sm font-medium shadow-lg"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTopic(t)}
                            className="hover:bg-white/20 rounded-full p-1 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Test Cases Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TestCaseEditor
                label="Public Test Cases"
                cases={formData.testCases}
                setCases={c => setFormData(p => ({ ...p, testCases: c }))}
                icon={<CheckCircle className="text-green-400" />}
              />
              <TestCaseEditor
                label="Hidden Test Cases"
                cases={formData.hiddenCases}
                setCases={c => setFormData(p => ({ ...p, hiddenCases: c }))}
                icon={<Target className="text-orange-400" />}
              />
            </div>
          </div>

          {/* Sidebar - Submit Button */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Add Problem'
                )}
              </button>

              {/* Info Card */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle size={18} className="text-blue-400" />
                  Quick Tips
                </h3>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>• Fill in all required fields (*)</li>
                  <li>• Add at least one test case</li>
                  <li>• Select relevant topics</li>
                  <li>• Provide clear descriptions</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TestCaseEditor({ label, cases, setCases, icon }) {
  const addCase = () => {
    setCases([...cases, { input: '', expected: '' }]);
  };

  const removeCase = (index) => {
    setCases(cases.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-bold">{label}</h3>
      </div>
      
      <div className="space-y-4">
        {cases.map((tc, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-300">Test Case {i + 1}</span>
              <button
                type="button"
                onClick={() => removeCase(i)}
                className="p-1 hover:bg-red-500/20 rounded transition-all"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Input</label>
                <textarea
                  value={tc.input}
                  onChange={e => {
                    const c = [...cases];
                    c[i].input = e.target.value;
                    setCases(c);
                  }}
                  placeholder="e.g., [2,7,11,15], 9"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 text-sm resize-none"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expected Output</label>
                <textarea
                  value={tc.expected}
                  onChange={e => {
                    const c = [...cases];
                    c[i].expected = e.target.value;
                    setCases(c);
                  }}
                  placeholder="e.g., [0,1]"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addCase}
        className="w-full mt-4 py-3 border-2 border-dashed border-white/30 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-white"
      >
        <Plus size={20} />
        Add Test Case
      </button>
    </div>
  );
}