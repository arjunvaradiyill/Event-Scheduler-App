'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
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
    name: string;
    email: string;
  };
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'nextMonth' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter((event) => event._id !== eventId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  // Date filtering logic
  const filterEvents = (events: Event[]) => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      switch (dateFilter) {
        case 'today':
          return (
            eventDate.getDate() === today.getDate() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return eventDate >= weekAgo && eventDate <= weekFromNow;
        }
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);
          return eventDate >= monthAgo && eventDate <= monthFromNow;
        }
        case 'nextMonth': {
          const year = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
          const month = (today.getMonth() + 1) % 12;
          const startOfNextMonth = new Date(year, month, 1);
          const endOfNextMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
          return eventDate >= startOfNextMonth && eventDate <= endOfNextMonth;
        }
        case 'year': {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          return eventDate >= startOfYear && eventDate <= endOfYear;
        }
        case 'custom': {
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate + 'T00:00:00');
            const endDate = new Date(customEndDate + 'T23:59:59');
            return eventDate >= startDate && eventDate <= endDate;
          }
          return true;
        }
        default:
          return true;
      }
    });
  };

  // Sorting logic (by date only)
  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  // Filter and sort events for display
  const displayedEvents = sortEvents(filterEvents(events));

  // Format date as dd-mm-yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Add a helper to format time in 12-hour format
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Event Management</h1>
          <p className="text-white/80">Manage all events in the system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {/* Modern, simple filter bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-200 rounded-lg p-3 mb-6">
          {/* Date Filter */}
          <label className="text-gray-700 text-sm font-medium">
            Date:
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Events</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="nextMonth">Next Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>
          {/* Sorting Filter */}
          <label className="text-gray-700 text-sm font-medium">
            Sort by:
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="asc">Date (Oldest First)</option>
              <option value="desc">Date (Newest First)</option>
            </select>
          </label>
          {/* Custom Range Inputs */}
          {dateFilter === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </>
          )}
          {(dateFilter !== 'all' || customStartDate || customEndDate) && (
            <button
              onClick={() => {
                setDateFilter('all');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="ml-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm"
            >
              Clear
            </button>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-4 font-semibold">Title</th>
                  <th className="text-left py-4 px-4 font-semibold">Date</th>
                  <th className="text-left py-4 px-4 font-semibold">Location</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Organizer</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedEvents.map((event) => (
                  <tr key={event._id} className="border-b border-white/10">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-white/70">{event.category}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div>{formatDate(event.date)}</div>
                        <div className="text-sm text-white/70 font-bold">
                          {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{event.location}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          event.status === 'upcoming'
                            ? 'bg-green-500/20 text-green-200'
                            : event.status === 'ongoing'
                            ? 'bg-blue-500/20 text-blue-200'
                            : event.status === 'completed'
                            ? 'bg-gray-500/20 text-gray-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{event.organizer.name}</div>
                        <div className="text-sm text-white/70">{event.organizer.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/events/${event._id}/edit`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 