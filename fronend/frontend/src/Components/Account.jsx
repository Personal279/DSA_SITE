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
          github: profileRes.data.git_link || profileRes.data.gitLink || '',
          linkedin: profileRes.data.linked_link || profileRes.data.linkedLink || ''
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
      const payload = {
        username: formData.username,
        email: formData.email,
        git_link: formData.github,
        linked_link: formData.linkedin
      };

      const res = await api.put(`/profile/${userId}`, payload);
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
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide text-sm">Syncing secure profile data...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <p className="text-slate-400 text-lg font-medium">Profile architecture not resolved.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-lg bg-[#151924] border border-slate-800 rounded-[28px] shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
                  <Edit3 size={16} className="text-slate-950" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-100">Modify Profile Parameters</h2>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors group">
                <X size={18} className="text-slate-500 group-hover:text-slate-200 transition-colors" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {[
                { label: 'Username', key: 'username', icon: User, placeholder: 'Your unique identifier' },
                { label: 'Email Address', key: 'email', icon: Mail, placeholder: 'your@email.com' },
                { label: 'GitHub Profile Link', key: 'github', icon: Github, placeholder: 'https://github.com/username' },
                { label: 'LinkedIn Directory Link', key: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
              ].map(({ label, key, icon: Icon, placeholder }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-500/70">{label}</label>
                  <div className="relative group">
                    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-slate-200 text-sm placeholder:text-slate-700 focus:outline-none focus:border-amber-600 focus:bg-[#151924] transition-all duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 rounded-xl bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-500 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                    <span>Committing...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Parameters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className="bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Code size={18} className="text-slate-950" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">Coding Master</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Profile Card Header */}
        <div className="relative bg-[#151924] border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="p-0.5 rounded-[24px] bg-gradient-to-tr from-amber-400 to-amber-600">
              <div className="w-24 h-24 rounded-[22px] bg-[#0B0F19] flex items-center justify-center font-black text-4xl text-white tracking-tighter">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{profile.username}</h1>
              <p className="text-sm text-slate-400 flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} className="text-amber-500" /> {profile.email}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-[#0B0F19] border border-slate-800 px-3 py-1.5 rounded-lg">
                  <MapPin size={12} /> India
                </span>
                {profile.git_link && (
                  <a href={profile.git_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-[#0B0F19] border border-slate-800 px-3 py-1.5 rounded-lg hover:border-amber-600 hover:text-white transition-all">
                    <Github size={12} /> GitHub
                  </a>
                )}
                {profile.linked_link && (
                  <a href={profile.linked_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-[#0B0F19] border border-slate-800 px-3 py-1.5 rounded-lg hover:border-amber-600 hover:text-white transition-all">
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-[#0B0F19] hover:bg-amber-600 border border-slate-800 hover:border-amber-500 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-slate-950 shadow-lg active:scale-95">
            Edit Profile
          </button>
        </div>

        {/* Stats Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Solved" value={profile.totalSolved ?? 0} icon={BookOpen} color="from-amber-400 to-amber-600" />
          <StatCard label="Easy Target" value={profile.easySolved ?? 0} icon={Trophy} color="from-amber-400 to-amber-600" />
          <StatCard label="Medium Tier" value={profile.mediumSolved ?? 0} icon={Zap} color="from-amber-400 to-amber-600" />
          <StatCard label="Hard Mode" value={profile.hardSolved ?? 0} icon={Target} color="from-amber-400 to-amber-600" />
        </div>

        {/* Recent Submissions */}
        <div className="bg-[#151924] border border-slate-800 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center">
                <TrendingUp size={16} className="text-slate-950" />
              </div>
              <h2 className="font-bold text-white text-lg">System Logs Matrix</h2>
            </div>
            <span className="text-xs font-bold uppercase text-amber-500 bg-amber-950/30 border border-amber-900/50 px-3 py-1.5 rounded-lg">
              {recent.length} Submissions Processed
            </span>
          </div>

          {recent.length === 0 ? (
            <div className="p-16 text-center text-slate-600">Execution Buffer Empty</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recent.map((r, i) => (
                <div key={i} className="flex justify-between items-center px-8 py-4.5 hover:bg-slate-800/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${r.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-semibold text-slate-300 text-sm">{r.problemTitle || r.title}</span>
                  </div>
                  <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-md border ${r.status === 'ACCEPTED' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900' : 'bg-rose-950/30 text-rose-400 border-rose-900'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`* { scrollbar-width: none; }`}</style>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[#151924] border border-slate-800 rounded-2xl p-5 hover:border-amber-700 transition-all">
    <div className="flex flex-col justify-between h-24">
      <div className="flex justify-between items-start w-full">
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
        <div className={`p-2 bg-gradient-to-br ${color} rounded-xl`}>
          <Icon size={16} className="text-slate-950" />
        </div>
      </div>
      <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
  </div>
);

export default AccountPage;