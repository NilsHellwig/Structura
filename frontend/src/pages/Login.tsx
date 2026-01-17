import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LockKey, ArrowRight } from 'phosphor-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import api from '../lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const darkMode = useUIStore((state) => state.darkMode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.access_token, username);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${
      darkMode ? 'bg-[#0d0d0d]' : 'bg-[#f7f7f8]'
    }`}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-sm font-semibold ${
            darkMode ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            S
          </div>
          <h1 className={`mt-3 text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Sign in to Structura
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Use your credentials to continue
          </p>
        </div>

        <div className={`rounded-lg border ${
          darkMode ? 'bg-[#0f0f12] border-gray-800' : 'bg-white border-gray-200'
        } p-6 shadow-sm`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded border outline-none transition-colors ${
                    darkMode
                      ? 'bg-[#0b0b0f] border-gray-800 text-white placeholder-gray-500 focus:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-500'
                  }`}
                  placeholder="yourname"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockKey size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded border outline-none transition-colors ${
                    darkMode
                      ? 'bg-[#0b0b0f] border-gray-800 text-white placeholder-gray-500 focus:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className={`text-sm px-3 py-2 rounded border ${
                darkMode
                  ? 'bg-red-900/20 border-red-800 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-md font-medium transition-colors disabled:opacity-60 ${
                darkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <p className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          No account?{' '}
          <Link
            to="/register"
            className={darkMode ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
