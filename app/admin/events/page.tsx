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
                {events.map((event) => (
                  <tr key={event._id} className="border-b border-white/10">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-white/70">{event.category}</div>
                        </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div>{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-sm text-white/70">
                          {event.startTime} - {event.endTime}
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