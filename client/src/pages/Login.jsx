import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPassword, roleLabel) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPassword);
      addToast(`Logged in as ${roleLabel}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'organizer') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-terracotta-600 via-amber-600 to-terracotta-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-terracotta-600/20 mb-3">
            <span>🪔</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to <span className="text-terracotta-600">UtsavLocal</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Sign in to discover, bookmark, and RSVP to Bengaluru community events.
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>1-Click Evaluator Demo Sign In</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                handleDemoFill(
                  'admin@utsavlocal.in',
                  'Admin@123',
                  'Community Admin'
                )
              }
              className="px-2 py-2 text-center rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-700 font-extrabold text-xs shadow-2xs transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() =>
                handleDemoFill(
                  'organizer@utsavlocal.in',
                  'Org@123',
                  'Event Organizer'
                )
              }
              className="px-2 py-2 text-center rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-800 font-extrabold text-xs shadow-2xs transition-all"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() =>
                handleDemoFill(
                  'user@utsavlocal.in',
                  'User@123',
                  'Local Citizen'
                )
              }
              className="px-2 py-2 text-center rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs shadow-2xs transition-all"
            >
              Citizen
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-extrabold text-sm shadow-md shadow-terracotta-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors"
              >
                Join UtsavLocal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
