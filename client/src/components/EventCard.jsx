import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/api';
import {
  MapPin,
  Clock,
  Heart,
  Users,
  Sparkles,
  Ticket,
  ArrowUpRight,
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Cultural Festival': 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
  'Workshop': 'bg-amber-100 text-amber-900 border-amber-200',
  'Music & Arts': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Food & Bazaar': 'bg-rose-100 text-rose-800 border-rose-200',
  'Community Drive': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Sports': 'bg-sky-100 text-sky-800 border-sky-200',
};

const EventCard = ({ event, onSaveToggle }) => {
  const { isAuthenticated, isSaved, updateSavedEvents } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const saved = isSaved(event._id);
  const [saving, setSaving] = useState(false);

  // Parse and format date
  const eventDate = new Date(event.date);
  const monthName = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const dayNumber = eventDate.getDate();
  const weekday = eventDate.toLocaleString('default', { weekday: 'short' });

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please sign in to bookmark and save events', 'info');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const res = await userService.toggleSave(event._id);
      if (res.data.success) {
        updateSavedEvents(res.data.savedEvents);
        addToast(res.data.message, res.data.isSaved ? 'terracotta' : 'info');
        if (onSaveToggle) {
          onSaveToggle(event._id, res.data.isSaved);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update bookmark', 'error');
    } finally {
      setSaving(false);
    }
  };

  const badgeStyle =
    CATEGORY_COLORS[event.category] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-terracotta-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Event Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20"></div>

        {/* Date Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-1.5 px-2.5 text-center shadow-md border border-white/40">
          <div className="text-[10px] font-extrabold uppercase text-terracotta-700 tracking-wider">
            {monthName}
          </div>
          <div className="text-lg font-black text-slate-900 leading-none">
            {dayNumber}
          </div>
          <div className="text-[9px] font-semibold text-slate-500 uppercase mt-0.5">
            {weekday}
          </div>
        </div>

        {/* Bookmark Heart Button (Top Right) */}
        <button
          onClick={handleBookmarkClick}
          disabled={saving}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-200 ${
            saved
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
              : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white hover:scale-110'
          }`}
          title={saved ? 'Remove bookmark' : 'Bookmark this event'}
        >
          <Heart
            className={`w-4 h-4 ${saved ? 'fill-current' : ''}`}
          />
        </button>

        {/* Price / Free Badge (Bottom Right on Image) */}
        <div className="absolute bottom-3 right-3">
          {event.isFree ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-sm flex items-center space-x-1">
              <span>Free Entry</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm flex items-center space-x-1">
              <span>₹{event.ticketPrice}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Attendees Row */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeStyle}`}
            >
              {event.category}
            </span>

            <div className="flex items-center space-x-1 text-xs font-bold text-slate-500">
              <Users className="w-3.5 h-3.5 text-terracotta-600" />
              <span>{event.attendeesCount} going</span>
            </div>
          </div>

          {/* Event Title */}
          <Link to={`/events/${event._id}`}>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-terracotta-600 transition-colors line-clamp-1 mb-1.5">
              {event.title}
            </h3>
          </Link>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {event.description}
          </p>
        </div>

        {/* Card Footer: Venue & Action */}
        <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-semibold text-slate-700 truncate pr-2">
              <MapPin className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
              <span className="truncate">{event.neighborhood}</span>
              <span className="text-slate-300">•</span>
              <span className="truncate text-slate-500 font-normal">{event.venueName}</span>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.startTime}</span>
            </div>
          </div>

          {/* View Details Button */}
          <Link
            to={`/events/${event._id}`}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-terracotta-50 text-slate-700 hover:text-terracotta-700 font-bold text-xs flex items-center justify-center space-x-1 border border-slate-200/80 hover:border-terracotta-300 transition-all duration-200"
          >
            <span>View Details & Schedule</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
