import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../features/authSlice';
import { useTheme } from '../context/ThemeContext';
import { Terminal, Flame, LogOut, BookOpen, Trophy, MessageSquare, Cpu, Briefcase, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const linkClass = (path: string) => {
    return `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
      isActive(path)
        ? 'border-brand-500 text-brand-500'
        : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-200'
    }`;
  };

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo & Navigation */}
          <div className="flex">
            <Link to="/" className="flex items-center gap-2 mr-6 text-brand-500 font-bold text-lg select-none">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
              <span>CodeForge</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex space-x-1 items-center">
                <Link to="/" className={linkClass('/')}>
                  Dashboard
                </Link>
                <Link to="/problems" className={linkClass('/problems')}>
                  <BookOpen className="w-4 h-4" />
                  Problems
                </Link>
                <Link to="/contests" className={linkClass('/contests')}>
                  <Trophy className="w-4 h-4" />
                  Contests
                </Link>
                <Link to="/discuss" className={linkClass('/discuss')}>
                  <MessageSquare className="w-4 h-4" />
                  Discuss
                </Link>
                <Link to="/ai-sandbox" className={linkClass('/ai-sandbox')}>
                  <Cpu className="w-4 h-4" />
                  AI Prep
                </Link>
                <Link to="/playground" className={linkClass('/playground')}>
                  Playground
                </Link>
              </div>
            )}
            
            {/* Always visible developer link */}
            <div className="flex items-center ml-2">
              <Link to="/portfolio" className={linkClass('/portfolio')}>
                <Briefcase className="w-4 h-4" />
                Mukesh (Portfolio)
              </Link>
            </div>
          </div>

          {/* User Section / Auth Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Streak */}
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-semibold select-none border border-amber-200">
                  <Flame className="w-4 h-4 fill-amber-500 stroke-amber-600" />
                  <span>{user.profile?.streak || 0} Days</span>
                </div>

                {/* Avatar and name */}
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                  <img
                    src={user.profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                    alt="avatar"
                    className="w-7 h-7 rounded-full border border-zinc-200 bg-zinc-50"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs text-zinc-400 font-medium">Welcome,</div>
                    <div className="text-sm font-semibold text-zinc-700 leading-tight">
                      {user.username}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
