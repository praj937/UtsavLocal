import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, User, Mail, Lock, Sparkles, Compass, CalendarPlus } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // 'user' or 'organizer'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (!name.trim() || !email.trim() || !password) {
      addToast('Please fill in all registration fields', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await register(name, email, password, role);
      addToast(`Account created! Welcome to UtsavLocal, ${user.name}!`, 'success');
      if (user.role === 'organizer') {
        navigate('/submit-event');
      } else {
        navigate('/');
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-terracotta-600 via-amber-600 to-terracotta-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-terracotta-600/20 mb-3">
            <span>🪔</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Join the <span className="text-terracotta-600">UtsavLocal</span> Community
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Connect with your neighborhood's living traditions, workshops, and gatherings.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Gowda"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>
            </div>

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
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    formData.role === 'user'
                      ? 'border-terracotta-500 bg-terracotta-50/70 ring-2 ring-terracotta-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2 mb-1">
                    <Compass className="w-4 h-4 text-terracotta-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Local Citizen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Discover festivals, RSVP & save events
                  </p>
                </label>

                <label
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    formData.role === 'organizer'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={formData.role === 'organizer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2 mb-1">
                    <CalendarPlus className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Event Host
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Submit & manage neighborhood events
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-extrabold text-sm shadow-md shadow-terracotta-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors"
              >
                Sign In to Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
