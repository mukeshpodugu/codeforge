import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { authStart, authSuccess, authFailure } from '../features/authSlice';
import { authAPI } from '../services/api';
import { Terminal, Key, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setLocalError(null);
    dispatch(authStart());

    try {
      const response = await authAPI.login({ email, password });
      dispatch(authSuccess({
        token: response.data.token,
        user: response.data.user
      }));
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      dispatch(authFailure(msg));
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg border border-zinc-200 shadow-sm">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-brand-50 text-brand-500 rounded-lg mb-3">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Sign in to CodeForge</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Build your coding skills and prep for interviews
          </p>
        </div>

        {/* Errors */}
        {(localError || error) && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded text-sm">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-9 pr-3 py-2 border border-zinc-300 rounded text-sm placeholder-zinc-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-3 py-2 border border-zinc-300 rounded text-sm placeholder-zinc-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-4 border border-transparent rounded text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-zinc-200">
          <p className="text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
