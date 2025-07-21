'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Image from "next/image";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

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
  organizer: {
    name: string;
    email: string;
  };
  image?: string; // Added image property
}

interface GroupedEvents {
  [date: string]: Event[];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    category: '',
    image: '',
  });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, refreshTrigger]);

  // Handle refresh parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    console.log('URL refresh parameter:', refresh);
    if (refresh === '1' && user) {
      console.log('Triggering refresh from URL parameter');
      fetchEvents();
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [user]);



  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await fetch('/api/events');
      const data = await response.json();
      const eventsData = data.events || [];
      
      console.log('Fetched events:', eventsData.length);
      setEvents(eventsData);
      
      // Group events by date using local date key
      const grouped = eventsData.reduce((acc: GroupedEvents, event: Event) => {
        // Skip events without a date
        if (!event.date) {
          console.warn('Event without date:', event.title);
          return acc;
        }
        
        const dateObj = new Date(event.date);
        // Extract just the date part (YYYY-MM-DD) from the full ISO string
        const dateKey = getDateKey(dateObj);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
      }, {});
      
      setGroupedEvents(grouped);
      
      // Set default selected date to today or the first event date
      if (eventsData.length > 0) {
        // Find the first event date or use today
        const firstEventDate = new Date(eventsData[0].date);
        const today = new Date();
        setSelectedDate(firstEventDate);
      } else {
        // If no events, set to today
        setSelectedDate(new Date());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };



  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const payload = {
        ...createForm,
        duration: createForm.duration ? parseInt(createForm.duration) : undefined,
      };
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        setCreateError(data.error || 'Failed to create event');
        setCreateLoading(false);
        return;
      }
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', date: '', time: '', duration: '', location: '', category: '', image: '' });
      // Trigger immediate refresh
      setRefreshTrigger(prev => prev + 1);
      router.push('/dashboard?refresh=1');
    } catch (err) {
      setCreateError('Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calendar tile content: dot if events exist
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateKey = getDateKey(date);
      if (groupedEvents[dateKey]) {
        return <div className="flex justify-center mt-1"><span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span></div>;
      }
    }
    return null;
  };

  // Handle calendar date change
  const handleCalendarChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  };

  // Helper to get YYYY-MM-DD from a Date object in local time
  const getDateKey = (dateObj: Date | null) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Events for selected day
  const selectedDateKey = getDateKey(selectedDate);
  const dayEvents = groupedEvents[selectedDateKey] || [];

  // Debugging output
  console.log('Grouped event keys:', Object.keys(groupedEvents));
  console.log('Selected date key:', selectedDateKey);
  console.log('Events for selected day:', dayEvents);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/evento.png" alt="Evento Logo" width={40} height={40} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evento Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, <span className="font-semibold">{user.name}</span> <span className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">{user.role}</span></p>
          </div>
        </div>
        <button onClick={handleLogout} className="ml-4 bg-red-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition">Logout</button>
      </header>
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-8">
        {/* Admin Create Event Button */}
        {user.role === 'admin' && (
          <div className="flex justify-end mb-6">
            <Link
              href="/events/create"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        )}
        {/* Stats Widgets (admin only) */}
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">{events.length}</span>
              <span className="text-gray-700 mt-2">Total Events</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'upcoming').length}</span>
              <span className="text-gray-700 mt-2">Upcoming</span>
            </div>
          </div>
        )}
        {/* Main Content: Calendar & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRefreshTrigger(prev => prev + 1);
                      setSelectedDate(new Date());
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium transition hover:bg-green-600"
                    title="Refresh events"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium transition hover:bg-indigo-600"
                  >
                    Jump to Today
                  </button>
                </div>
              </div>
              <Calendar
                onChange={handleCalendarChange}
                value={selectedDate}
                tileContent={tileContent}
                calendarType="gregory"
                className="!bg-transparent !border-0 !text-gray-900"
                prevLabel={<span className="text-gray-700">‹</span>}
                nextLabel={<span className="text-gray-700">›</span>}
                formatShortWeekday={(locale, date) => date.toLocaleDateString(locale, { weekday: 'short' })[0]}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedDate ? `${getDayOfWeek(selectedDateKey)} - ${getFormattedDate(selectedDateKey)}` : 'Select a date'}
            </h3>
            {dayEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-500 text-lg">No events scheduled for this day.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dayEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-center mb-6">
                      <img
                        src={event.image || 'https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg'}
                        alt="Event image"
                        className="w-full max-h-56 object-cover rounded-lg border border-gray-200"
                        onError={(e) => (e.currentTarget.src = 'https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg')}
                      />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-2xl font-bold text-gray-900">{event.title}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-700 border border-green-200' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-base mb-3 line-clamp-2">{event.description}</p>
                    <div className="space-y-1 text-base text-gray-600 mb-6">
                      <p><span className="font-medium">Time:</span> {event.time} ({event.duration || 120} min)</p>
                      <p><span className="font-medium">Location:</span> {event.location}</p>
                      <p><span className="font-medium">Category:</span> {event.category}</p>
                      <p><span className="font-medium">Organizer:</span> {event.organizer?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium text-center transition hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href={`/events/${event._id}/edit`}
                          className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg text-base font-medium text-center transition hover:bg-yellow-600"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 