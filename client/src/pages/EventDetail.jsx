import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  CheckCircle,
  ArrowLeft,
  Tag,
  ShieldCheck,
  ExternalLink,
  Ticket,
} from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isSaved, isRsvped, updateSavedEvents, updateRsvpedEvents } =
    useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const res = await eventService.getById(id);
        if (res.data.success) {
          setEvent(res.data.data);

          // Fetch related events in the same category
          const relatedRes = await eventService.getAll({
            category: res.data.data.category,
          });
          if (relatedRes.data.success) {
            setRelatedEvents(
              relatedRes.data.data.filter((e) => e._id !== res.data.data._id).slice(0, 3)
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        addToast('Event not found or failed to load', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    window.scrollTo(0, 0);
  }, [id, navigate, addToast]);

  const saved = isSaved(id);
  const rsvped = isRsvped(id);

  // Toggle RSVP handler
  const handleRsvpToggle = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to RSVP for this event', 'info');
      navigate('/login');
      return;
    }

    try {
      setRsvpLoading(true);
      const res = await userService.toggleRsvp(id);
      if (res.data.success) {
        updateRsvpedEvents(res.data.rsvpedEvents);
        // Update local attendees count
        setEvent((prev) => ({
          ...prev,
          attendeesCount: res.data.attendeesCount,
        }));
        addToast(res.data.message, res.data.isRsvped ? 'success' : 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update RSVP status', 'error');
    } finally {
      setRsvpLoading(false);
    }
  };

  // Toggle Bookmark handler
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to bookmark events', 'info');
      navigate('/login');
      return;
    }

    try {
      setSaveLoading(true);
      const res = await userService.toggleSave(id);
      if (res.data.success) {
        updateSavedEvents(res.data.savedEvents);
        addToast(res.data.message, res.data.isSaved ? 'terracotta' : 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update bookmark', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Share event URL to clipboard
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Event URL copied to clipboard! Share it with friends!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mapsQuery = encodeURIComponent(`${event.venueName}, ${event.address}, Bengaluru`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Back button & top bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-terracotta-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Event Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Hero Banner Image */}
          <div className="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-black/30"></div>

            {/* Badges on Top */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 backdrop-blur-md shadow-md">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-terracotta-600 text-white backdrop-blur-md shadow-md flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.neighborhood}</span>
              </span>
            </div>

            {/* Quick action buttons floating on image */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-white shadow-md backdrop-blur-md transition-all"
                title="Share event link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className={`p-2.5 rounded-full shadow-md backdrop-blur-md transition-all ${
                  saved
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
                }`}
                title={saved ? 'Bookmarked' : 'Save Event'}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Banner Title overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{formattedDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row & Key Metrics */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            {/* Price & Attendees */}
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  Entry Pass
                </span>
                {event.isFree ? (
                  <span className="text-xl font-extrabold text-emerald-600 flex items-center space-x-1">
                    <span>Free Community Entry</span>
                  </span>
                ) : (
                  <span className="text-2xl font-black text-slate-900 flex items-center space-x-1">
                    <span>₹{event.ticketPrice}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      / participant
                    </span>
                  </span>
                )}
              </div>

              <div className="h-10 w-px bg-slate-200"></div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  Community Going
                </span>
                <div className="flex items-center space-x-1.5 text-lg font-black text-slate-800">
                  <Users className="w-5 h-5 text-terracotta-600" />
                  <span>{event.attendeesCount} Registered</span>
                </div>
              </div>
            </div>

            {/* Interactive RSVP & Bookmark Actions */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleRsvpToggle}
                disabled={rsvpLoading}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  rsvped
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-terracotta-600/25'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{rsvped ? '✓ You Are Going (RSVP Confirmed)' : 'RSVP / Register Going'}</span>
              </button>

              <button
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className={`px-4 py-3 rounded-xl font-bold text-sm border transition-colors flex items-center space-x-2 ${
                  saved
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-current text-rose-600' : ''}`} />
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Bookmark'}</span>
              </button>
            </div>
          </div>

          {/* Details Grid: Left Description, Right Sidebar */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Description & Highlights */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <span>About This Gathering</span>
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Event Guidelines */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-900">
                <h4 className="font-bold text-sm mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Community Guidelines & Tips</span>
                </h4>
                <ul className="text-xs sm:text-sm space-y-1.5 text-amber-800 list-disc list-inside">
                  <li>Please arrive 15 minutes before scheduled start time.</li>
                  <li>Support local neighborhood artisans and keep venues litter-free.</li>
                  <li>Carpooling or taking Namma Metro / BMTC is recommended.</li>
                </ul>
              </div>
            </div>

            {/* Right Sidebar: Venue, Organizer & Directions */}
            <div className="space-y-6">
              {/* Venue Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Location & Venue
                </h4>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-base flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-terracotta-600 flex-shrink-0 mt-0.5" />
                    <span>{event.venueName}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
                    {event.address}
                  </p>
                  <p className="text-xs font-bold text-terracotta-700 pl-7">
                    Neighborhood: {event.neighborhood}
                  </p>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-terracotta-300 text-slate-700 hover:text-terracotta-700 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Organizer Info Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Event Organizer
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {event.organizerId?.name ? event.organizerId.name.charAt(0) : 'O'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {event.organizerId?.name || 'Verified Community Organizer'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {event.organizerId?.email || 'Namma Bengaluru Cultural Trust'}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Bengaluru Community Host</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  More in {event.category}
                </h3>
                <p className="text-xs text-slate-500">
                  Explore other exciting gatherings happening across Bengaluru
                </p>
              </div>
              <Link
                to="/"
                className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((relEvent) => (
                <EventCard key={relEvent._id} event={relEvent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
