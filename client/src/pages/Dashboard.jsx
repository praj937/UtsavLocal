import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService, eventService } from '../services/api';
import EventCard from '../components/EventCard';
import {
  CalendarCheck,
  Bookmark,
  Layers,
  MapPin,
  Clock,
  PlusCircle,
  Trash2,
  Edit3,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const { user, isOrganizer, isAdmin, updateRsvpedEvents, updateSavedEvents } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rsvps'); // 'rsvps' | 'bookmarks' | 'submitted'
  const [dashboardData, setDashboardData] = useState({
    savedEvents: [],
    rsvpedEvents: [],
    submittedEvents: [],
  });
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getDashboard();
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast('Could not load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Cancel RSVP
  const handleCancelRsvp = async (eventId) => {
    try {
      const res = await userService.toggleRsvp(eventId);
      if (res.data.success) {
        updateRsvpedEvents(res.data.rsvpedEvents);
        setDashboardData((prev) => ({
          ...prev,
          rsvpedEvents: prev.rsvpedEvents.filter((e) => e._id !== eventId),
        }));
        addToast('RSVP removed from your schedule', 'info');
      }
    } catch (err) {
      addToast('Failed to cancel RSVP', 'error');
    }
  };

  // Remove Bookmark
  const handleRemoveBookmark = async (eventId) => {
    try {
      const res = await userService.toggleSave(eventId);
      if (res.data.success) {
        updateSavedEvents(res.data.savedEvents);
        setDashboardData((prev) => ({
          ...prev,
          savedEvents: prev.savedEvents.filter((e) => e._id !== eventId),
        }));
        addToast('Event removed from bookmarks', 'info');
      }
    } catch (err) {
      addToast('Failed to remove bookmark', 'error');
    }
  };

  // Delete Submitted Event (Organizer/Admin)
  const handleDeleteEvent = async (eventId, title) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await eventService.delete(eventId);
      if (res.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          submittedEvents: prev.submittedEvents.filter((e) => e._id !== eventId),
        }));
        addToast('Event removed successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete event', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      venueName: event.venueName,
      address: event.address,
      neighborhood: event.neighborhood,
      isFree: event.isFree,
      ticketPrice: event.ticketPrice,
      bannerImage: event.bannerImage,
    });
  };

  // Save Edit Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await eventService.update(editingEvent._id, editFormData);
      if (res.data.success) {
        addToast('Event updated successfully', 'success');
        setEditingEvent(null);
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update event', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading your community hub...</p>
      </div>
    );
  }

  const { savedEvents, rsvpedEvents, submittedEvents } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Summary Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-terracotta-600 via-amber-600 to-terracotta-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-terracotta-600/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {user.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : user.role === 'organizer'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {user.email} • Active Namma Bengaluru Citizen
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/submit-event"
                className="px-4 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-terracotta-600/20 flex items-center space-x-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Event</span>
              </Link>
            </div>
          </div>

          {/* Metrics Counters */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="p-2">
              <div className="text-2xl font-black text-terracotta-600">
                {rsvpedEvents.length}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Confirmed RSVPs
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-amber-600">
                {savedEvents.length}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Saved Bookmarks
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-indigo-600">
                {submittedEvents.length}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Submitted Events
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'rsvps'
                ? 'border-terracotta-600 text-terracotta-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Upcoming RSVPs ({rsvpedEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-terracotta-600 text-terracotta-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarked Events ({savedEvents.length})</span>
          </button>

          {(isOrganizer || isAdmin || submittedEvents.length > 0) && (
            <button
              onClick={() => setActiveTab('submitted')}
              className={`flex items-center space-x-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
                activeTab === 'submitted'
                  ? 'border-terracotta-600 text-terracotta-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Submitted Events ({submittedEvents.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: RSVPs Content */}
        {activeTab === 'rsvps' && (
          <div>
            {rsvpedEvents.length > 0 ? (
              <div className="space-y-4">
                {rsvpedEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  return (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-terracotta-300 transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={event.bannerImage}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-terracotta-100 text-terracotta-800">
                              {event.category}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Going Confirmed</span>
                            </span>
                          </div>

                          <Link to={`/events/${event._id}`}>
                            <h3 className="text-base font-bold text-slate-900 hover:text-terracotta-600 transition-colors">
                              {event.title}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                              <span>{event.neighborhood} ({event.venueName})</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {eventDate.toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                at {event.startTime}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <Link
                          to={`/events/${event._id}`}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleCancelRsvp(event._id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                        >
                          Cancel RSVP
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6">
                <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No upcoming RSVPs yet
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Browse community festivals, workshops, and gatherings in Bengaluru and hit RSVP to secure your spot!
                </p>
                <Link
                  to="/"
                  className="px-4 py-2 bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Explore Events Feed
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookmarks Content */}
        {activeTab === 'bookmarks' && (
          <div>
            {savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard
                      event={event}
                      onSaveToggle={(id, isSaved) => {
                        if (!isSaved) {
                          setDashboardData((prev) => ({
                            ...prev,
                            savedEvents: prev.savedEvents.filter((e) => e._id !== id),
                          }));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No bookmarked events
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Click the heart icon on any event card to save it for later review!
                </p>
                <Link
                  to="/"
                  className="px-4 py-2 bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Explore Bengaluru Events
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Submitted Events Content */}
        {activeTab === 'submitted' && (
          <div>
            {submittedEvents.length > 0 ? (
              <div className="space-y-4">
                {submittedEvents.map((event) => {
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                      <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Moderator Review</span>
                    </span>
                  );

                  if (event.status === 'approved') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live on Public Feed</span>
                      </span>
                    );
                  } else if (event.status === 'rejected') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Revision Requested / Rejected</span>
                      </span>
                    );
                  }

                  return (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={event.bannerImage}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1.5">
                            {statusBadge}
                            <span className="text-xs font-bold text-slate-500">
                              {event.attendeesCount} RSVPs
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {event.title}
                          </h3>

                          <div className="text-xs text-slate-500 mt-1 font-medium flex items-center space-x-2">
                            <span>{event.neighborhood}</span>
                            <span>•</span>
                            <span>{event.category}</span>
                            <span>•</span>
                            <span>
                              {new Date(event.date).toLocaleDateString()} at{' '}
                              {event.startTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Organizer Controls */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {event.status === 'approved' && (
                          <Link
                            to={`/events/${event._id}`}
                            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="View public page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleOpenEdit(event)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-terracotta-300 text-xs font-bold text-slate-700 hover:text-terracotta-600 flex items-center space-x-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id, event.title)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  You haven't submitted any events yet
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Are you organizing a neighborhood festival or workshop? Publish it to the community now.
                </p>
                <Link
                  to="/submit-event"
                  className="px-4 py-2 bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Submit Your First Event
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-lg font-black text-slate-900">
                  Edit Event: {editingEvent.title}
                </h3>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.venueName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          venueName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.startTime}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.endTime}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold shadow-sm"
                  >
                    {updating ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
