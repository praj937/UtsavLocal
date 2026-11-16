import axios from 'axios';
import { getInitialEvents, DEMO_USERS } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Timeout fast so we can fall back seamlessly to local mock store when deployed
});

// Interceptor to inject JWT Bearer Token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('utsavlocal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Standalone Client-Side Data Store (Ensures 100% functionality on Vercel/Cloud)
// ---------------------------------------------------------------------------
const STORAGE_EVENTS_KEY = 'utsavlocal_standalone_events';
const STORAGE_USERS_KEY = 'utsavlocal_standalone_users';
const CURRENT_USER_KEY = 'utsavlocal_user';

const getStoredEvents = () => {
  const data = localStorage.getItem(STORAGE_EVENTS_KEY);
  if (!data) {
    const initial = getInitialEvents();
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const saveStoredEvents = (events) => {
  localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
};

const getStoredUsers = () => {
  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  return JSON.parse(data);
};

const getCurrentLocalUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (userJson) {
    return JSON.parse(userJson);
  }
  return DEMO_USERS[2]; // Default to Citizen
};

// Safe API wrapper: tries backend first; falls back to client store if backend unreachable
const withFallback = async (apiCall, fallbackFn) => {
  try {
    return await apiCall();
  } catch (error) {
    // If backend is unreachable (e.g. deployed on Vercel or localhost server not started)
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error')
    ) {
      const fallbackResult = await fallbackFn();
      return { data: fallbackResult };
    }
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Modular API Services
// ---------------------------------------------------------------------------
export const authService = {
  register: (data) =>
    withFallback(
      () => api.post('/auth/register', data),
      () => {
        const users = getStoredUsers();
        const newUser = {
          _id: 'user_' + Date.now(),
          name: data.name,
          email: data.email.toLowerCase(),
          role: data.role === 'organizer' ? 'organizer' : 'user',
          savedEvents: [],
          rsvpedEvents: [],
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        localStorage.setItem('utsavlocal_token', 'demo_jwt_token_' + newUser._id);
        return { success: true, token: 'demo_jwt_token_' + newUser._id, user: newUser };
      }
    ),

  login: (data) =>
    withFallback(
      () => api.post('/auth/login', data),
      () => {
        const users = getStoredUsers();
        const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        if (!user) {
          throw new Error('Invalid email or password credentials');
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem('utsavlocal_token', 'demo_jwt_token_' + user._id);
        return { success: true, token: 'demo_jwt_token_' + user._id, user };
      }
    ),

  getMe: () =>
    withFallback(
      () => api.get('/auth/me'),
      () => {
        const user = getCurrentLocalUser();
        return { success: true, user };
      }
    ),
};

export const eventService = {
  getAll: (params = {}) =>
    withFallback(
      () => api.get('/events', { params }),
      () => {
        let events = getStoredEvents().filter((e) => e.status === 'approved');

        if (params.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          events = events.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              e.neighborhood.toLowerCase().includes(q) ||
              e.venueName.toLowerCase().includes(q)
          );
        }

        if (params.category && params.category !== 'All') {
          events = events.filter((e) => e.category === params.category);
        }

        if (params.neighborhood && params.neighborhood !== 'All') {
          events = events.filter(
            (e) => e.neighborhood.toLowerCase() === params.neighborhood.toLowerCase()
          );
        }

        if (params.isFree !== undefined && params.isFree !== '') {
          const isFreeBool = params.isFree === true || params.isFree === 'true';
          events = events.filter((e) => e.isFree === isFreeBool);
        }

        if (params.timeframe === 'weekend') {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const daysToSat = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
          const sat = new Date(today);
          sat.setDate(today.getDate() + daysToSat);
          sat.setHours(0, 0, 0, 0);
          const sun = new Date(sat);
          sun.setDate(sat.getDate() + 1);
          sun.setHours(23, 59, 59, 999);

          events = events.filter((e) => {
            const d = new Date(e.date);
            return d >= sat && d <= sun;
          });
        }

        return { success: true, count: events.length, data: events };
      }
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/events/${id}`),
      () => {
        const events = getStoredEvents();
        const event = events.find((e) => e._id.toString() === id.toString());
        if (!event) throw new Error('Event not found');
        return { success: true, data: event };
      }
    ),

  create: (data) =>
    withFallback(
      () => api.post('/events', data),
      () => {
        const events = getStoredEvents();
        const user = getCurrentLocalUser();
        const isAutoApprove = user.role === 'admin';

        const newEvent = {
          _id: 'ev_' + Date.now(),
          ...data,
          organizerId: { _id: user._id, name: user.name, email: user.email },
          status: isAutoApprove ? 'approved' : 'pending',
          attendeesCount: 0,
          createdAt: new Date().toISOString(),
        };

        events.push(newEvent);
        saveStoredEvents(events);

        return {
          success: true,
          message: isAutoApprove
            ? 'Event created and published immediately (Admin)'
            : 'Event submitted successfully! Awaiting community moderator review.',
          data: newEvent,
        };
      }
    ),

  update: (id, data) =>
    withFallback(
      () => api.put(`/events/${id}`, data),
      () => {
        const events = getStoredEvents();
        const index = events.findIndex((e) => e._id.toString() === id.toString());
        if (index === -1) throw new Error('Event not found');
        events[index] = { ...events[index], ...data };
        saveStoredEvents(events);
        return { success: true, message: 'Event updated successfully', data: events[index] };
      }
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/events/${id}`),
      () => {
        let events = getStoredEvents();
        events = events.filter((e) => e._id.toString() !== id.toString());
        saveStoredEvents(events);
        return { success: true, message: 'Event removed successfully' };
      }
    ),
};

export const userService = {
  toggleSave: (eventId) =>
    withFallback(
      () => api.post(`/users/save/${eventId}`),
      () => {
        const user = getCurrentLocalUser();
        user.savedEvents = user.savedEvents || [];
        const isSaved = user.savedEvents.includes(eventId);

        if (isSaved) {
          user.savedEvents = user.savedEvents.filter((id) => id !== eventId);
        } else {
          user.savedEvents.push(eventId);
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return {
          success: true,
          isSaved: !isSaved,
          message: !isSaved ? 'Event saved to your bookmarks!' : 'Event removed from bookmarks',
          savedEvents: user.savedEvents,
        };
      }
    ),

  toggleRsvp: (eventId) =>
    withFallback(
      () => api.post(`/users/rsvp/${eventId}`),
      () => {
        const user = getCurrentLocalUser();
        const events = getStoredEvents();
        const event = events.find((e) => e._id.toString() === eventId.toString());

        user.rsvpedEvents = user.rsvpedEvents || [];
        const isRsvped = user.rsvpedEvents.includes(eventId);

        if (isRsvped) {
          user.rsvpedEvents = user.rsvpedEvents.filter((id) => id !== eventId);
          if (event) event.attendeesCount = Math.max(0, (event.attendeesCount || 1) - 1);
        } else {
          user.rsvpedEvents.push(eventId);
          if (event) event.attendeesCount = (event.attendeesCount || 0) + 1;
        }

        saveStoredEvents(events);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return {
          success: true,
          isRsvped: !isRsvped,
          message: !isRsvped ? 'RSVP confirmed! See you at the event!' : 'RSVP cancelled successfully',
          attendeesCount: event ? event.attendeesCount : 0,
          rsvpedEvents: user.rsvpedEvents,
        };
      }
    ),

  getDashboard: () =>
    withFallback(
      () => api.get('/users/dashboard'),
      () => {
        const user = getCurrentLocalUser();
        const events = getStoredEvents();
        const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

        const savedEvents = (user.savedEvents || [])
          .map((id) => eventMap.get(id.toString()))
          .filter(Boolean);

        const rsvpedEvents = (user.rsvpedEvents || [])
          .map((id) => eventMap.get(id.toString()))
          .filter(Boolean);

        const submittedEvents = events.filter(
          (e) =>
            e.organizerId &&
            (e.organizerId._id === user._id || e.organizerId.email === user.email)
        );

        return {
          success: true,
          data: {
            user,
            savedEvents,
            rsvpedEvents,
            submittedEvents,
          },
        };
      }
    ),
};

export const adminService = {
  getPendingEvents: () =>
    withFallback(
      () => api.get('/admin/events/pending'),
      () => {
        const events = getStoredEvents();
        const pending = events.filter((e) => e.status === 'pending');
        return { success: true, count: pending.length, data: pending };
      }
    ),

  updateStatus: (id, status) =>
    withFallback(
      () => api.patch(`/admin/events/${id}/status`, { status }),
      () => {
        const events = getStoredEvents();
        const event = events.find((e) => e._id.toString() === id.toString());
        if (!event) throw new Error('Event not found');
        event.status = status;
        saveStoredEvents(events);
        return { success: true, message: `Event has been successfully ${status}`, data: event };
      }
    ),

  getStats: () =>
    withFallback(
      () => api.get('/admin/stats'),
      () => {
        const events = getStoredEvents();
        const totalApproved = events.filter((e) => e.status === 'approved').length;
        const totalPending = events.filter((e) => e.status === 'pending').length;
        const totalRejected = events.filter((e) => e.status === 'rejected').length;
        const totalRsvps = events
          .filter((e) => e.status === 'approved')
          .reduce((acc, curr) => acc + (curr.attendeesCount || 0), 0);

        return {
          success: true,
          data: {
            totalApproved,
            totalPending,
            totalRejected,
            totalUsers: 1,
            totalOrganizers: 1,
            totalRsvps,
          },
        };
      }
    ),
};

export default api;
