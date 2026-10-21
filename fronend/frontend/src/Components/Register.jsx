import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, Mail, Sparkles, UserPlus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        alert("Registration successful. Please login.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F19] flex items-center justify-center p-6 relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#151924] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          
          <div className="relative p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-900/20 mb-1">
                <UserPlus className="w-7 h-7 text-slate-950" />
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Start your coding journey today
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {/* Form Fields - Reusing the same structure with updated classes */}
              {[
                { name: 'username', label: 'Username', icon: User, type: 'text', placeholder: 'Choose a username' },
                { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@example.com' },
                { name: 'password', label: 'Password', icon: Lock, type: showPassword ? 'text' : 'password', placeholder: '••••••••' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{field.label}</label>
                  <div className="relative group">
                    <field.icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === field.name ? 'text-amber-500' : 'text-slate-600'}`} />
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-11 pr-3.5 py-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-amber-700 transition-all"
                      placeholder={field.placeholder}
                    />
                    {field.name === 'password' && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl font-bold py-3 bg-amber-600 text-slate-950 hover:bg-amber-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={() => navigate("/")} className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      <style>{`* { scrollbar-width: none; }`}</style>
    </div>
  );
}