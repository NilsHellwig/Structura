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
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-3">
            Join Structura
          </h1>
          <p className={`text-[11px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Initialize Structured Core Account
          </p>
        </div>

        <div className={`p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${
          darkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white/90 border-zinc-100 shadow-zinc-200/50'
        }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Identity Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-5 py-4 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-700 focus:border-blue-500/50 focus:bg-zinc-900'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-blue-500/30 focus:bg-white'
                  }`}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-5 py-4 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-700 focus:border-blue-500/50 focus:bg-zinc-900'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-blue-500/30 focus:bg-white'
                  }`}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest pl-1 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-5 py-4 text-sm font-bold rounded-2xl border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-700 focus:border-blue-500/50 focus:bg-zinc-900'
                      : 'bg-zinc-50/50 border-zinc-100 text-zinc-900 placeholder-zinc-300 focus:border-blue-500/30 focus:bg-white'
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
                className="text-[11px] font-black uppercase tracking-widest text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'bg-white text-zinc-900 hover:bg-zinc-200 shadow-xl shadow-white/5'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10'
              }`}
            >
              {loading ? 'Creating Identity...' : 'Register'}
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>
        </div>

        <p className={`mt-8 text-center text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Already have an account?{' '}
          <Link
            to="/login"
            className={`${darkMode ? 'text-zinc-100 hover:text-blue-400' : 'text-zinc-900 hover:text-blue-600'} transition-colors ml-2`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}