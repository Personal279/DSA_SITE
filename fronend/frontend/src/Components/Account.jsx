/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Code, Settings, Edit3, MapPin, Github, Linkedin,
  Mail, BookOpen, Trophy, Zap, Target, ChevronRight,
  TrendingUp, X, Save, User
} from 'lucide-react';
import api from '../api/api';

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = token.split('.')[1];
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  return decoded.userId;
};

const AccountPage = () => {
  const userId = getUserIdFromToken();
  const [profile, setProfile] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', github: '', linkedin: ''
  });

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const [profileRes, recentRes] = await Promise.all([
          api.get(`/profile/${userId}`),
          api.get(`/profile/${userId}/recent`)
        ]);
        setFormData({
          username: profileRes.data.username || '',
          email: profileRes.data.email || '',
          github: profileRes.data.git_link || '',
          linkedin: profileRes.data.Linked_link || ''
        });
        setProfile(profileRes.data);
        setRecent(recentRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/profile/${userId}`, formData);
      setProfile(prev => ({ ...prev, ...res.data }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-purple-200 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Edit3 size={18} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {[
                { label: 'Username', key: 'username', icon: User, placeholder: 'Your username' },
                { label: 'Email', key: 'email', icon: Mail, placeholder: 'your@email.com' },
                { label: 'GitHub URL', key: 'github', icon: Github, placeholder: 'https://github.com/username' },
                { label: 'LinkedIn URL', key: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
              ].map(({ label, key, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-purple-300/80 mb-2">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/60" />
                    <input
                      value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save size={16} />
                }
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-18 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Coding Master
            </span>
          </div>
          <button className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
            <Settings size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

        {/* Profile Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/25 to-pink-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                  <span className="text-5xl font-bold text-white">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-400 rounded-full border-[3px] border-slate-900 shadow-lg" />
              </div>

              {/* Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
                <p className="text-purple-200/80 flex items-center gap-2 mb-4 text-base">
                  <Mail size={16} /> {profile.email}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-2 text-sm text-purple-300/70 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    <MapPin size={14} /> India
                  </span>
                  {profile.git_link && (
                    <a href={profile.git_link} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-purple-300/70 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-purple-500/40 hover:text-white transition-all">
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {profile.Linked_link && (
                    <a href={profile.Linked_link} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-purple-300/70 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-purple-500/40 hover:text-white transition-all">
                      <Linkedin size={14} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-xl transition-all text-sm text-white/70 hover:text-white flex-shrink-0"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Problems Solved" value={profile.solved} icon={BookOpen} color="from-emerald-500 to-teal-500" />
          <StatCard label="Global Rank" value={`#${profile.rank}`} icon={Trophy} color="from-amber-500 to-orange-500" />
          <StatCard label="Day Streak" value={`${profile.streak} 🔥`} icon={Zap} color="from-purple-500 to-pink-500" />
          <StatCard label="Acceptance Rate" value={`${profile.acceptanceRate}%`} icon={Target} color="from-blue-500 to-cyan-500" />
        </div>

        {/* Recent Submissions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="flex items-center gap-4 px-8 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <h2 className="font-bold text-white text-xl">Recent Submissions</h2>
            <span className="ml-auto text-sm text-white/40 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
              {recent.length} submissions
            </span>
          </div>

          {recent.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <Code size={32} className="text-purple-400/50" />
              </div>
              <p className="text-white/60 font-semibold text-lg">No submissions yet</p>
              <p className="text-white/30 text-sm mt-2">Start solving problems to track your progress!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((r, i) => (
                <div key={i} className="flex justify-between items-center px-8 py-5 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      r.status === 'ACCEPTED' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' :
                      r.status === 'ATTEMPTED' ? 'bg-rose-400 shadow-lg shadow-rose-400/50' :
                      'bg-amber-400 shadow-lg shadow-amber-400/50'
                    }`} />
                    <span className="font-semibold text-white/90 group-hover:text-white transition-colors text-base">
                      {r.problemTitle || r.title || `Problem #${r.problemId}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm px-4 py-1.5 rounded-full font-semibold ${
                      r.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : r.status === 'ATTEMPTED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {r.status}
                    </span>
                    <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] cursor-default">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
    <div className="relative flex justify-between items-start">
      <div>
        <p className="text-4xl font-bold text-white mb-2">{value}</p>
        <p className="text-sm text-white/50 font-medium">{label}</p>
      </div>
      <div className={`p-3.5 bg-gradient-to-br ${color} rounded-2xl shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

export default AccountPage;