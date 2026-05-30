import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { authStart, authSuccess, authFailure } from '../features/authSlice';
import { authAPI } from '../services/api';
import { Terminal, Key, Mail, User, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLocalError(null);
    dispatch(authStart());

    try {
      const response = await authAPI.register({ username, email, password });
      dispatch(authSuccess({
        token: response.data.token,
        user: response.data.user
      }));
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Try a different username/email.';
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
          <h2 className="text-2xl font-bold text-zinc-900">Create an Account</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Join CodeForge to master coding interviews
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
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer_mode"
                className="block w-full pl-9 pr-3 py-2 border border-zinc-300 rounded text-sm placeholder-zinc-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Password
            </label>
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-zinc-200">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
