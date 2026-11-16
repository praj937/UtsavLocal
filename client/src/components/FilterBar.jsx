import React from 'react';
import {
  CalendarDays,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cultural Festival',
  'Workshop',
  'Music & Arts',
  'Food & Bazaar',
  'Community Drive',
  'Sports',
];

const NEIGHBORHOODS = [
  'All',
  'Basavanagudi',
  'Malleshwaram',
  'Indiranagar',
  'Jayanagar',
  'Koramangala',
  'Sadashivanagar',
  'Hebbal',
  'Sampangi Rama Nagar',
  'Tigalarpet',
  'Whitefield',
  'HSR Layout',
];

const FilterBar = ({
  selectedCategory,
  setSelectedCategory,
  selectedNeighborhood,
  setSelectedNeighborhood,
  isFreeOnly,
  setIsFreeOnly,
  timeframe,
  setTimeframe,
  totalResults,
  onReset,
}) => {
  const isFiltered =
    selectedCategory !== 'All' ||
    selectedNeighborhood !== 'All' ||
    isFreeOnly ||
    timeframe !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Tag className="w-3.5 h-3.5 text-terracotta-600" />
          <span>Browse By Category</span>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 text-xs font-bold text-terracotta-600 hover:text-terracotta-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-terracotta-600 text-white shadow-sm shadow-terracotta-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Neighborhood Selector */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-500 flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 mr-1" />
            Area:
          </span>
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-terracotta-500 text-xs sm:text-sm shadow-2xs"
          >
            <option value="All">All Bengaluru Neighborhoods</option>
            {NEIGHBORHOODS.filter((n) => n !== 'All').map((hood) => (
              <option key={hood} value={hood}>
                {hood}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles: Weekend & Free */}
        <div className="flex items-center space-x-2.5">
          {/* This Weekend Toggle */}
          <button
            onClick={() =>
              setTimeframe(timeframe === 'weekend' ? '' : 'weekend')
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
              timeframe === 'weekend'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>This Weekend</span>
          </button>

          {/* Free Entry Only Toggle */}
          <button
            onClick={() => setIsFreeOnly(!isFreeOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
              isFreeOnly
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Free Entry Only</span>
          </button>
        </div>

        {/* Results Counter */}
        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="font-extrabold text-slate-700">{totalResults}</span> events
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
