import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Tag,
  User,
  Users,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const AdminModeration = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const { addToast } = useToast();

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, statsRes] = await Promise.all([
        adminService.getPendingEvents(),
        adminService.getStats(),
      ]);

      if (pendingRes.data.success) {
        setPendingEvents(pendingRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      addToast('Could not load pending events or admin stats', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle Approve or Reject
  const handleStatusUpdate = async (eventId, newStatus, eventTitle) => {
    try {
      setProcessingId(eventId);
      const res = await adminService.updateStatus(eventId, newStatus);
      if (res.data.success) {
        setPendingEvents((prev) => prev.filter((e) => e._id !== eventId));
        if (newStatus === 'approved') {
          addToast(`"${eventTitle}" approved and published to the public feed!`, 'success');
        } else {
          addToast(`"${eventTitle}" has been rejected.`, 'info');
        }
        // Refresh stats
        adminService.getStats().then((r) => r.data.success && setStats(r.data.data));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update event status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading admin moderation queue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Community Trust & Quality Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Event Moderation Queue
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Verify community event submissions, review venue legitimacy, and approve gatherings for the public feed.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center space-x-2 shadow-2xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Pending Review</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalPending}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Requires admin approval</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved Events</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalApproved}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Live on public feed</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" />
                <span>Platform RSVPs</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalRsvps}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Citizen attendee signups</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Organizers & Users</span>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalUsers + stats.totalOrganizers}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.totalOrganizers} verified organizers
              </p>
            </div>
          </div>
        )}

        {/* Pending Submissions Queue */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Pending Submissions</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                {pendingEvents.length} in queue
              </span>
            </h2>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="space-y-6">
              {pendingEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:border-slate-300 transition-all"
                >
                  {/* Event Banner */}
                  <div className="lg:w-1/3 h-52 lg:h-auto relative bg-slate-100 flex-shrink-0">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/95 text-slate-900 shadow">
                        {event.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Event Details and Decision Actions */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
                          Neighborhood: {event.neighborhood}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Submitted on {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                        {event.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {event.description}
                      </p>

                      {/* Event Key Facts */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 text-xs font-medium text-slate-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{event.venueName}</span>
                        </div>
                      </div>

                      {/* Organizer Details */}
                      <div className="text-xs text-slate-500 mb-4 flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted by: </span>
                        <span className="font-bold text-slate-700">
                          {event.organizerId?.name || 'Local Organizer'}
                        </span>
                        <span>({event.organizerId?.email || 'N/A'})</span>
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                      <button
                        onClick={() =>
                          handleStatusUpdate(event._id, 'rejected', event.title)
                        }
                        disabled={processingId === event._id}
                        className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Submission</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStatusUpdate(event._id, 'approved', event.title)
                        }
                        disabled={processingId === event._id}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish to Feed</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Queue State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Moderation Queue is Clean!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                All submitted community festivals and neighborhood gatherings have been reviewed and processed.
              </p>
              <button
                onClick={fetchAdminData}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors"
              >
                Re-check Queue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModeration;
