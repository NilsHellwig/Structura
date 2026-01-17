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
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      darkMode ? 'bg-zinc-950' : 'bg-zinc-50'
    }`}>
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-xl font-extrabold manrope-font shadow-sm ${
            darkMode ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
          }`}>
            S
          </div>
          <h1 className={`mt-6 text-3xl font-extrabold manrope-font ${darkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            Create Account
          </h1>
          <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
            Join Structura to get started
          </p>
        </div>

        <div className={`rounded-lg border p-8 shadow-sm ${
          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <User size={18} weight="bold" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-sm font-medium rounded-lg border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-white'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'
                  }`}
                  placeholder="nilshellwig"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <LockKey size={18} weight="bold" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-sm font-medium rounded-lg border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-white'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                darkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <LockKey size={18} weight="bold" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 text-sm font-medium rounded-lg border outline-none transition-all ${
                    darkMode
                      ? 'bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-white'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-sm px-3 py-3 rounded-lg border font-bold text-center ${
                  darkMode
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-red-50 border-red-100 text-red-600'
                }`}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                loading
                  ? 'bg-zinc-800 cursor-not-allowed text-zinc-500'
                  : darkMode
                    ? 'bg-zinc-100 hover:bg-white text-zinc-900 active:scale-[0.98]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98]'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} weight="bold" />}
            </button>
          </form>
        </div>

        <p className={`mt-8 text-center text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
          Already have an account?{' '}
          <Link
            to="/login"
            className={`${darkMode ? 'text-zinc-100' : 'text-zinc-900'} hover:underline font-bold ml-1`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
