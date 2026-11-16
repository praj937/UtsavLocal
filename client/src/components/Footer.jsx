import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, MapPin, Compass, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-sm">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-terracotta-600 via-amber-600 to-terracotta-500 flex items-center justify-center text-lg shadow-md shadow-terracotta-500/20">
                <span>🪔</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Utsav<span className="text-terracotta-500">Local</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-xs sm:text-sm leading-relaxed">
              A 3rd-semester Computer Science & Engineering community engagement
              initiative connecting Bengaluru residents to neighborhood cultural
              festivals, artisan workshops, indie performances, and civic drives.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400/90 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ • Preserving Namma Ooru's Living Heritage</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore UtsavLocal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="hover:text-terracotta-400 transition-colors"
                >
                  Discovery Feed
                </Link>
              </li>
              <li>
                <Link
                  to="/submit-event"
                  className="hover:text-terracotta-400 transition-colors"
                >
                  Submit Neighborhood Event
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-terracotta-400 transition-colors"
                >
                  Citizen RSVP Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-terracotta-400 transition-colors"
                >
                  Admin Moderation Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Neighborhood Hubs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Active Neighborhoods
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                'Basavanagudi',
                'Malleshwaram',
                'Indiranagar',
                'Jayanagar',
                'Koramangala',
                'Hebbal',
                'Sadashivanagar',
                'Sampangi Nagar',
              ].map((n) => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} UtsavLocal Bengaluru. Built for Community Engagement & Academic Excellence.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for Bengaluru</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
