import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, isOfflineMode } from '../services/storage';
import { Mail, Lock, User as UserIcon, Briefcase, ArrowRight, Shield, WifiOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(isOfflineMode());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user, error: loginError } = await loginUser(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError(loginError || 'Invalid Email or Password');
        }
      } else {
        // Registration
        if (!name || !email || !password || !position) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        
        const { user: newUser, error: regError } = await registerUser({ name, email, password, position });
        
        if (newUser) {
          onLogin(newUser);
        } else {
          setError(regError || 'Registration failed.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
        <h1 className="text-[12rem] font-black text-white whitespace-nowrap animate-pulse">NEXORACREW</h1>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/20">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider">
            {isLogin ? 'NEXORACREW LOGIN PAGE' : 'CREATE NEXORACREW ACCOUNT'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {loading ? 'Processing...' : 'Financial Management System'}
          </p>
        </div>

        {isOffline && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs text-center flex items-center justify-center gap-2">
                <WifiOff size={14} />
                <span>Running in Offline Demo Mode (Local Storage)</span>
            </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. Owner, Auditor, Manager"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin@nexoracrew.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center mt-6 ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <span>{loading ? 'Verifying...' : (isLogin ? 'Access Dashboard' : 'Register Account')}</span>
            {!loading && <ArrowRight size={18} className="ml-2" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};