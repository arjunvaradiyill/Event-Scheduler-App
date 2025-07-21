'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: number;
  location: string;
  category: string;
  status: string;
  maxAttendees?: number;
  price?: number;
  contactEmail?: string;
  contactPhone?: string;
  requirements?: string;
  image?: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    date: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchEvents();
  }, [user, filters, pagination.page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.date && { date: filters.date }),
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
    } catch (error) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Refresh events list
      fetchEvents();
    } catch (error) {
      setError('Failed to delete event');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event status');
      }

      // Refresh events list
      fetchEvents();
    } catch (error) {
      setError('Failed to update event status');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-white/70 hover:text-white mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">
                  Admin Events Management
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white/90 text-sm">
                  Admin: <span className="font-semibold">{user.name}</span>
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="webinar">Webinar</option>
                    <option value="party">Party</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Events ({pagination.total})
              </h2>
              <div className="text-white/70 text-sm">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-4">Loading events...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                  <p className="text-white/70 text-lg">No events found.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 transition-all duration-300 hover:bg-white/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                          <p className="text-white/80 text-sm mb-3">{event.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value={event.status}
                            onChange={(e) => handleStatusChange(event._id, e.target.value)}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            event.status === 'upcoming' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
                            event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' :
                            event.status === 'completed' ? 'bg-gray-500/20 text-gray-200 border border-gray-500/30' :
                            'bg-red-500/20 text-red-200 border border-red-500/30'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-white/70 mb-4">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {event.time} ({event.duration || 120} min)
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {event.location}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {event.category}
                        </div>
                        <div>
                          <span className="font-medium">Organizer:</span> {event.organizer?.name || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span> {event.contactEmail || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Max Attendees:</span> {event.maxAttendees || 'Unlimited'}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {event.price ? `$${event.price}` : 'Free'}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Link
                          href={`/events/${event._id}`}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/events/${event._id}/edit`}
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white/70">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 