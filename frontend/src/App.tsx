import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { authSuccess, logout } from './features/authSlice';
import { authAPI } from './services/api';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProblemList } from './pages/ProblemList';
import { ProblemWorkspace } from './pages/ProblemWorkspace';
import { Playground } from './pages/Playground';
import { Contests } from './pages/Contests';
import { Discuss } from './pages/Discuss';
import { AiSandbox } from './pages/AiSandbox';
import { Portfolio } from './pages/Portfolio';

// Auth Guard Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          dispatch(authSuccess({
            token,
            user: response.data.user
          }));
        } catch (err) {
          console.warn('Session restoration failed. Clearing token.');
          dispatch(logout());
        }
      }
    };
    restoreSession();
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {/* Navigation */}
        <Navbar />

        {/* Content Body */}
        <main className="flex-1">
          <Routes>
            {/* Public Auth routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} 
            />

            {/* Developer Portfolio is public */}
            <Route path="/portfolio" element={<Portfolio />} />

            {/* Protected Workspace routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems" 
              element={
                <ProtectedRoute>
                  <ProblemList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems/:slug" 
              element={
                <ProtectedRoute>
                  <ProblemWorkspace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/playground" 
              element={
                <ProtectedRoute>
                  <Playground />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contests" 
              element={
                <ProtectedRoute>
                  <Contests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discuss" 
              element={
                <ProtectedRoute>
                  <Discuss />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-sandbox" 
              element={
                <ProtectedRoute>
                  <AiSandbox />
                </ProtectedRoute>
              } 
            />

            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
