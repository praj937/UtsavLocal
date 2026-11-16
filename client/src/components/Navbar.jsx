import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/api';
import {
  Compass,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isOrganizer, logout, login } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDemoDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // If user is admin, fetch pending count for the badge
  useEffect(() => {
    if (isAdmin) {
      adminService
        .getPendingEvents()
        .then((res) => {
          if (res.data.success) {
            setPendingCount(res.data.count);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, location.pathname]);

  const handleQuickLogin = async (email, password, roleLabel) => {
    try {
      await login(email, password);
      addToast(`Switched account to ${roleLabel}!`, 'success');
      setDemoDropdownOpen(false);
      if (email === 'admin@utsavlocal.in') {
        navigate('/admin');
      } else if (email === 'organizer@utsavlocal.in') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out', 'info');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-terracotta-600 via-amber-600 to-terracotta-500 flex items-center justify-center shadow-md shadow-terracotta-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🪔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-terracotta-600 transition-colors">
                Utsav<span className="text-terracotta-600">Local</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 -mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Namma Bengaluru
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-terracotta-600" />
              <span>Explore</span>
            </Link>

            <Link
              to="/submit-event"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/submit-event')
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Submit Event</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-terracotta-50 text-terracotta-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors relative ${
                  isActive('/admin')
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'text-slate-700 hover:text-rose-700 hover:bg-rose-50/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Admin Panel</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[11px] font-extrabold bg-rose-600 text-white rounded-full leading-none animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* 1-Click Demo Accounts Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors shadow-2xs"
                title="Quickly switch between pre-seeded demo accounts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Logins</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-amber-600" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() =>
                      handleQuickLogin(
                        'admin@utsavlocal.in',
                        'Admin@123',
                        'Community Admin'
                      )
                    }
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center justify-between text-slate-700 hover:text-rose-700"
                  >
                    <div>
                      <div className="font-bold">Pooja (Admin)</div>
                      <div className="text-[11px] text-slate-400">
                        admin@utsavlocal.in
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                      Admin
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleQuickLogin(
                        'organizer@utsavlocal.in',
                        'Org@123',
                        'Event Organizer'
                      )
                    }
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center justify-between text-slate-700 hover:text-amber-800"
                  >
                    <div>
                      <div className="font-bold">Ramesh (Organizer)</div>
                      <div className="text-[11px] text-slate-400">
                        organizer@utsavlocal.in
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                      Organizer
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleQuickLogin(
                        'user@utsavlocal.in',
                        'User@123',
                        'Local Citizen'
                      )
                    }
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-slate-700 hover:text-emerald-800"
                  >
                    <div>
                      <div className="font-bold">Ananya (Citizen)</div>
                      <div className="text-[11px] text-slate-400">
                        user@utsavlocal.in
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      Citizen
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Sign In Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-terracotta-300 hover:bg-terracotta-50/50 transition-all text-xs font-semibold text-slate-700"
                >
                  <div className="flex flex-col text-right">
                    <span className="font-bold truncate max-w-[120px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                      {user.role}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-terracotta-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-terracotta-100 text-terracotta-800 rounded text-[10px] font-bold uppercase">
                        {user.role} account
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>My Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>Admin Queue ({pendingCount})</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-terracotta-600 text-white hover:bg-terracotta-700 shadow-sm transition-all shadow-terracotta-600/20"
                >
                  Join Utsav
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/')
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-5 h-5 text-terracotta-600" />
              <span>Explore Events</span>
            </Link>

            <Link
              to="/submit-event"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/submit-event')
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <span>Submit Local Event</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold ${
                  isActive('/dashboard')
                    ? 'bg-terracotta-50 text-terracotta-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-semibold bg-rose-50 text-rose-700"
              >
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Admin Moderation</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-rose-600 text-white rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  handleQuickLogin(
                    'admin@utsavlocal.in',
                    'Admin@123',
                    'Community Admin'
                  )
                }
                className="px-2 py-1.5 text-center bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200"
              >
                Admin
              </button>
              <button
                onClick={() =>
                  handleQuickLogin(
                    'organizer@utsavlocal.in',
                    'Org@123',
                    'Event Organizer'
                  )
                }
                className="px-2 py-1.5 text-center bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-200"
              >
                Organizer
              </button>
              <button
                onClick={() =>
                  handleQuickLogin(
                    'user@utsavlocal.in',
                    'User@123',
                    'Local Citizen'
                  )
                }
                className="px-2 py-1.5 text-center bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200"
              >
                Citizen
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full bg-terracotta-600 text-white font-bold flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 text-sm font-bold text-white bg-terracotta-600 rounded-lg"
                >
                  Join Utsav
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
