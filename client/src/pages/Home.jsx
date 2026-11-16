import React, { useState, useEffect, useCallback } from 'react';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import EventCard from '../components/EventCard';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sparkles, Calendar, Frown, RefreshCw } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [timeframe, setTimeframe] = useState('');

  const { addToast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedNeighborhood !== 'All') params.neighborhood = selectedNeighborhood;
      if (isFreeOnly) params.isFree = 'true';
      if (timeframe) params.timeframe = timeframe;

      const response = await eventService.getAll(params);
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      addToast('Could not load events from the server', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedNeighborhood, isFreeOnly, timeframe, addToast]);

  // Debounced fetch for search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedNeighborhood('All');
    setIsFreeOnly(false);
    setTimeframe('');
  };

  const handleSelectNeighborhoodFromHero = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    // Scroll down to filters smoothly
    const filterElement = document.getElementById('events-section');
    if (filterElement) {
      filterElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Hero
        search={search}
        setSearch={setSearch}
        onSelectNeighborhood={handleSelectNeighborhoodFromHero}
      />

      {/* Main Events Feed Section */}
      <main id="events-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Interactive Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedNeighborhood={selectedNeighborhood}
          setSelectedNeighborhood={setSelectedNeighborhood}
          isFreeOnly={isFreeOnly}
          setIsFreeOnly={setIsFreeOnly}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          totalResults={events.length}
          onReset={handleResetFilters}
        />

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 h-96 animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 rounded-xl mb-4"></div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="h-9 bg-slate-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          /* Events Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              No matching events found
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We couldn't find any community events matching your active filters.
              Try broadening your category or neighborhood selections.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
