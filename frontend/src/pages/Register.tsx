import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, LockKey, ArrowRight } from 'phosphor-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import api from '../lib/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const darkMode = useUIStore((state) => state.darkMode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { username, password });
      const loginResponse = await api.post('/auth/login', { username, password });
      login(loginResponse.data.access_token, username);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden ${
      darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      {/* Decorative Blur Elements - Much more colorful */}
      <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-30 transition-all duration-1000 ${
        darkMode ? 'bg-amber-600/30' : 'bg-yellow-400/30'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 transition-all duration-1000 ${
        darkMode ? 'bg-purple-600/20' : 'bg-purple-400/20'
      }`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 transition-all duration-1000 ${
        darkMode ? 'bg-blue-500/20' : 'bg-blue-400/20'
      }`} />

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-black tracking-tighter mb-3 leading-none">
            Structura
          </h1>
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${darkMode ? 'text-zinc-100' : 'text-zinc-700'}`}>
            Intelligent Structured Prompting
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-10 rounded-[2.5rem] border shadow-2xl backdrop-blur-3xl relative overflow-hidden ${
            darkMode 
              ? 'bg-zinc-900/60 border-white/10 shadow-black/50' 
              : 'bg-white/80 border-zinc-100 shadow-zinc-200/70'
          }`}
        >
          {/* Inner Glow Effects */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${darkMode ? 'bg-amber-500' : 'bg-amber-400'}`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${darkMode ? 'bg-purple-500' : 'bg-purple-400'}`} />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Username
              </label>
              <div className="relative group">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-zinc-600 group-focus-within:text-yellow-500' : 'text-zinc-400 group-focus-within:text-yellow-500'}`}>
                  <User size={18} weight="bold" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4.5 h-14 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-950/50 border-white/5 text-white placeholder-zinc-700 focus:border-yellow-500/30 focus:bg-zinc-950'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-yellow-500/20 focus:bg-white'
                  }`}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Password
              </label>
              <div className="relative group">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-zinc-600 group-focus-within:text-yellow-500' : 'text-zinc-400 group-focus-within:text-yellow-500'}`}>
                  <LockKey size={18} weight="bold" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4.5 h-14 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-950/50 border-white/5 text-white placeholder-zinc-700 focus:border-yellow-500/30 focus:bg-zinc-950'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-yellow-500/20 focus:bg-white'
                  }`}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Confirm Password
              </label>
              <div className="relative group">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-zinc-600 group-focus-within:text-yellow-500' : 'text-zinc-400 group-focus-within:text-yellow-500'}`}>
                  <LockKey size={18} weight="bold" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-14 pr-6 py-4.5 h-14 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-950/50 border-white/5 text-white placeholder-zinc-700 focus:border-yellow-500/30 focus:bg-zinc-950'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-yellow-500/20 focus:bg-white'
                  }`}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl shadow-white/5'
                    : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl shadow-black/20'
              }`}
            >
              {loading ? 'Initializing...' : 'Register'}
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-10 text-center text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className={`transition-all pb-0.5 border-b border-transparent ${
              darkMode 
                ? 'text-zinc-100 hover:text-yellow-500 hover:border-yellow-500/50' 
                : 'text-zinc-900 hover:text-yellow-600 hover:border-yellow-600/50'
            } ml-2`}
          >
            Login
          </Link>
        </motion.p>
      </div>
    </div>
  );
}