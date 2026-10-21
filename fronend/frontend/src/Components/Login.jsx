/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email: formData.email }));

      navigate('/Problems');
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Invalid Email or Password');
      }else if(error.response?.status===429){
        alert('Too many failed attempts. Please wait 60 seconds and try again.');
      } else {
        alert('Server error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/auth/google', {
        idToken: credentialResponse.credential,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);

      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      localStorage.setItem('user', JSON.stringify({
        email: payload.email,
        name: payload.name,
        provider: 'google',
      }));

      navigate('/Problems');
    } catch (error) {
      alert('Google login failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e293b,_transparent)] pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#151924]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="relative p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-900/20 mb-2 transform transition-transform hover:scale-105">
                <Lock className="w-7 h-7 text-slate-950" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
              <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-amber-500' : 'text-slate-600'}`} />
                  <input
                    name="email" type="email" value={formData.email} onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-11 pr-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-600 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-amber-500' : 'text-slate-600'}`} />
                  <input
                    name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-600 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full rounded-xl font-bold py-3 bg-amber-600 text-slate-950 hover:bg-amber-500 transition-all active:scale-[0.98]">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#151924] text-slate-500">or continue with</span></div>
            </div>

            {isGoogleLoading ? (
              <div className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 py-3 rounded-xl">
                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Signing in...</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google login failed.')} theme="filled_black" shape="rectangular" width="400" />
              </div>
            )}

            <p className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button onClick={() => navigate('/Register')} className="text-amber-500 font-bold hover:underline">Sign up</button>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        * { scrollbar-width: none; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        .animate-pulse { animation: pulse 4s infinite; }
      `}</style>
    </div>
  );
}