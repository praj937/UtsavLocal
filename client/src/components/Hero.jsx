import React from 'react';
import { Search, MapPin, Sparkles, Calendar, HeartHandshake } from 'lucide-react';

const Hero = ({ search, setSearch, onSelectNeighborhood }) => {
  const popularNeighborhoods = [
    'Basavanagudi',
    'Malleshwaram',
    'Indiranagar',
    'Jayanagar',
    'Koramangala',
    'Hebbal',
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-terracotta-50/40 to-slate-50 pt-10 pb-12 border-b border-slate-200/60">
      {/* Decorative cultural pattern shapes */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-terracotta-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-gradient-to-tr from-terracotta-500/10 to-amber-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-terracotta-100/80 border border-terracotta-200 text-terracotta-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-600 animate-spin" />
            <span>Namma Bengaluru Community Engagement Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            Celebrate Bengaluru's <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-terracotta-600 via-amber-600 to-terracotta-700 bg-clip-text text-transparent">
              Neighborhood Culture & Festivals
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Discover historic temple walks in Basavanagudi, Carnatic recitals in
            Malleshwaram, artisan pottery workshops in Indiranagar, and community
            lake cleanups across Namma Ooru.
          </p>

          {/* Live Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-lg shadow-terracotta-900/5 rounded-2xl bg-white border border-slate-200/90 focus-within:border-terracotta-500 focus-within:ring-4 focus-within:ring-terracotta-500/10 transition-all p-1.5">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-5 h-5 text-terracotta-600" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, description, or neighborhood (e.g. Kadalekayi, Pottery, Veena)..."
                className="w-full pl-3 pr-4 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Neighborhood Jump Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
              <span className="text-slate-500 font-semibold flex items-center mr-1">
                <MapPin className="w-3.5 h-3.5 text-terracotta-600 mr-1" />
                Popular Hubs:
              </span>
              {popularNeighborhoods.map((hood) => (
                <button
                  key={hood}
                  onClick={() => onSelectNeighborhood(hood)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-terracotta-400 hover:bg-terracotta-50 text-slate-700 hover:text-terracotta-700 font-medium transition-all shadow-2xs"
                >
                  {hood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Highlights Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-2">
            <div className="text-2xl font-black text-terracotta-700">100%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Verified Neighborhood Gatherings
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-black text-amber-600">8+</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Bengaluru Local Hubs
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-black text-emerald-600">Free</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Community Access Focused
            </div>
          </div>
          <div className="p-2">
            <div className="text-2xl font-black text-indigo-600">Instant</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              RSVP & Calendar Booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
