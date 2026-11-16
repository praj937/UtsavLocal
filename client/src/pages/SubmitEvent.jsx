import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventService } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Image,
  DollarSign,
  Send,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'Cultural Festival',
  'Workshop',
  'Music & Arts',
  'Food & Bazaar',
  'Community Drive',
  'Sports',
];

const NEIGHBORHOODS = [
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

const PRESET_BANNERS = [
  {
    name: 'Cultural Festival / Temple Fair',
    url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Classical Music Recital',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Pottery / Craft Workshop',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sunday Park Book Swap',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Lake Cleanup / Tree Planting',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Food & Coffee Fest',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
];

const SubmitEvent = () => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cultural Festival',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venueName: '',
    address: '',
    neighborhood: 'Basavanagudi',
    isFree: true,
    ticketPrice: 0,
    bannerImage: PRESET_BANNERS[0].url,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePresetSelect = (url) => {
    setFormData((prev) => ({ ...prev, bannerImage: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      addToast('Please provide both an event title and description', 'error');
      return;
    }

    if (!formData.venueName.trim() || !formData.address.trim()) {
      addToast('Please specify the venue landmark and street address', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        ticketPrice: formData.isFree ? 0 : Number(formData.ticketPrice),
      };

      const res = await eventService.create(payload);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      addToast(err.response?.data?.message || 'Failed to submit event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Event Host Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Host a Neighborhood Gathering
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Publish your cultural festival, artisan workshop, music jam, or charity drive
            to thousands of active Bengaluru residents.
          </p>

          {!isOrganizer && !isAdmin && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Note for Citizens:</span> You are currently signed in as a Citizen. To post events, use the Demo Login menu above to switch to the <span className="font-bold">Event Organizer</span> or <span className="font-bold">Community Admin</span> role.
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Form and Live Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6"
            >
              {/* Event Title */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  maxLength={120}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Kadalekayi Parishe Heritage Walk & Groundnut Fair"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the cultural significance, activities, highlights, and what participants should expect..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 focus:ring-3 focus:ring-terracotta-500/10 text-sm font-medium leading-relaxed"
                />
              </div>

              {/* Category & Neighborhood Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-semibold text-slate-800 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Bengaluru Neighborhood *
                  </label>
                  <select
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-semibold text-slate-800 bg-white"
                  >
                    {NEIGHBORHOODS.map((hood) => (
                      <option key={hood} value={hood}>
                        {hood}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="text"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    placeholder="e.g. 01:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Venue Name & Street Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Venue Landmark / Hall *
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    required
                    value={formData.venueName}
                    onChange={handleChange}
                    placeholder="e.g. Seetha Rama Bhavana & Courtyard"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Full Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 8th Cross, Margosa Road, Malleshwaram"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-terracotta-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Free or Paid Ticket */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                  Pricing & Admission
                </label>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFree"
                      checked={formData.isFree === true}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isFree: true,
                          ticketPrice: 0,
                        }))
                      }
                      className="text-terracotta-600 focus:ring-terracotta-500 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-slate-800">
                      Free Community Gathering
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFree"
                      checked={formData.isFree === false}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, isFree: false }))
                      }
                      className="text-terracotta-600 focus:ring-terracotta-500 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-slate-800">
                      Paid Ticketed Workshop / Show
                    </span>
                  </label>

                  {!formData.isFree && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        name="ticketPrice"
                        min="1"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        placeholder="Price in INR"
                        className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-bold focus:outline-none focus:border-terracotta-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Select Banner Image Preset or Enter Custom URL
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-2 text-xs font-semibold transition-all ${
                        formData.bannerImage === preset.url
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-800 ring-2 ring-terracotta-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  name="bannerImage"
                  value={formData.bannerImage}
                  onChange={handleChange}
                  placeholder="Or enter custom image URL (https://...)"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:border-terracotta-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-extrabold text-sm shadow-md shadow-terracotta-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Publishing Event...'
                      : isAdmin
                      ? 'Publish Event Directly (Admin Auto-Approval)'
                      : 'Submit Event for Moderation'}
                  </span>
                </button>
                <p className="text-center text-xs text-slate-400 mt-2.5">
                  Submissions by organizers undergo verification by community admins to maintain quality.
                </p>
              </div>
            </form>
          </div>

          {/* Right Col: Live Preview Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                <Eye className="w-4 h-4 text-terracotta-600" />
                <span>Live Event Card Preview</span>
              </div>

              {/* Preview Container */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={formData.bannerImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 rounded-xl p-1 px-2.5 text-center shadow">
                    <div className="text-[10px] font-extrabold text-terracotta-700">
                      {new Date(formData.date).toLocaleString('default', {
                        month: 'short',
                      }).toUpperCase()}
                    </div>
                    <div className="text-base font-black text-slate-900 leading-none">
                      {new Date(formData.date).getDate()}
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    {formData.isFree ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow">
                        Free Entry
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow">
                        ₹{formData.ticketPrice || 0}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta-100 text-terracotta-800">
                    {formData.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {formData.title || 'Untitled Gathering'}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {formData.description || 'Event description will appear here...'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-600 flex items-center justify-between">
                    <div className="flex items-center space-x-1 truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
                      <span className="truncate">{formData.neighborhood}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {formData.startTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitEvent;
