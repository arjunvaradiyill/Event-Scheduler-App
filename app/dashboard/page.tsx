'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from "next/image";

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
  createdBy?: {
    name?: string;
    email?: string;
  };
  image?: string;
  maxAttendees?: number;
  price?: number;
  contactEmail?: string;
  contactPhone?: string;
  requirements?: string;
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
  
  // Admin event modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    status: '',
    maxAttendees: '',
    price: '',
    contactEmail: '',
    contactPhone: '',
    requirements: '',
    image: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      
      // Set default selected date to today
        setSelectedDate(new Date());
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

  // Admin modal functions
  const openAdminModal = (event: Event) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      status: event.status,
      maxAttendees: event.maxAttendees?.toString() || '',
      price: event.price?.toString() || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      requirements: event.requirements || '',
      image: event.image || '',
    });
    setShowAdminModal(true);
    setEditError('');
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setSelectedEvent(null);
    setEditForm({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      category: '',
      status: '',
      maxAttendees: '',
      price: '',
      contactEmail: '',
      contactPhone: '',
      requirements: '',
      image: '',
    });
    setEditError('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setEditError('');
    setEditLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${selectedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          maxAttendees: editForm.maxAttendees ? parseInt(editForm.maxAttendees) : undefined,
          price: editForm.price ? parseFloat(editForm.price) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update event');
        setEditLoading(false);
        return;
      }

      closeAdminModal();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      setEditError('Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${selectedEvent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to delete event');
        setDeleteLoading(false);
        return;
      }

      closeAdminModal();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      setEditError('Failed to delete event');
    } finally {
      setDeleteLoading(false);
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

  // Helper to get YYYY-MM-DD from a Date object in local time
  const getDateKey = (dateObj: Date | null) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get sorted dates for timeline
  const getSortedDates = () => {
    const dates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return dates;
  };

  // Get events for a specific date, sorted by time
  const getSortedEventsForDate = (dateKey: string) => {
    const dayEvents = groupedEvents[dateKey] || [];
    return dayEvents.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
      const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
      return timeA - timeB;
    });
  };

  if (!user) {
    return null;
  }

  const sortedDates = getSortedDates();

  return (
    <div className="min-h-screen relative">
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        {/* Sticky header with glassmorphism */}
        <header className="sticky top-0 z-20 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/evento.png" alt="Evento Logo" width={40} height={40} />
            <div>
              <h1 className="text-2xl font-bold text-white">Evento Dashboard</h1>
              <p className="text-white/80 text-sm mt-1">Welcome back, <span className="font-semibold text-white">{user.name}</span> <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs text-white border border-white/30">{user.role}</span></p>
            </div>
          </div>
          <button onClick={handleLogout} className="ml-4 bg-red-500/80 backdrop-blur-sm text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:bg-red-600/90 transition-all duration-200 border border-red-400/30">Logout</button>
        </header>
              <main className="max-w-7xl mx-auto py-10 px-4 sm:px-8">
          {/* Admin Create Event Button */}
          {user.role === 'admin' && (
            <div className="flex justify-end mb-6">
              <Link
                href="/events/create"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg border border-blue-400/30 backdrop-blur-sm"
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
                <span className="text-3xl font-bold text-blue-300">{events.length}</span>
                <span className="text-white/80 mt-2 block">Total Events</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
                <span className="text-3xl font-bold text-green-300">{events.filter(e => e.status === 'upcoming').length}</span>
                <span className="text-white/80 mt-2 block">Upcoming</span>
              </div>
            </div>
          )}

          {/* Timeline Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Event Timeline</h2>
            <button
              onClick={() => {
                setRefreshTrigger(prev => prev + 1);
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 shadow-lg border border-green-400/30 backdrop-blur-sm"
              title="Refresh events"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

        {/* Timeline View */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white/80 text-lg font-medium">No events scheduled</p>
              <p className="text-white/60 text-sm mt-2">Create your first event to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
              const dayEvents = getSortedEventsForDate(dateKey);
              const isToday = getDateKey(new Date()) === dateKey;
              return (
                <div key={dateKey} className="flex items-start gap-6 w-full">
                  {/* Date Column */}
                  <div className="flex flex-col items-center min-w-[120px] max-w-[140px] w-[12vw]">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center mb-3 ${isToday ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl border border-blue-400/50' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg'}`}> 
                      <span className="text-2xl font-bold">{new Date(dateKey).getDate()}</span>
                      <span className="text-xs font-medium">{getDayOfWeek(dateKey).slice(0,3)}</span>
                    </div>
                    <div className="text-xs text-white/70 text-center">
                      {getFormattedDate(dateKey)}
                    </div>
                    {isToday && (
                      <span className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-semibold rounded-full border border-blue-400/30 backdrop-blur-sm">Today</span>
                    )}
                    <div className="mt-2 text-sm text-white/50">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</div>
                  </div>
                  {/* Events Row */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 pb-4">
                      {dayEvents.map((event) => (
                        <div key={event._id} className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 min-w-[340px] max-w-[380px] w-full flex flex-col p-0 hover:bg-white/15 transition-all duration-300">
                          <div className="flex justify-between items-center px-6 pt-6">
                            <div className="flex flex-col items-start">
                              <span className="text-lg font-bold text-white">{event.startTime} - {event.endTime}</span>
                              <span className="text-xs text-white/60">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              event.status === 'upcoming' ? 'bg-green-500/20 text-green-200 border border-green-400/30' :
                              event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30' :
                              event.status === 'completed' ? 'bg-gray-500/20 text-gray-200 border border-gray-400/30' :
                              'bg-red-500/20 text-red-200 border border-red-400/30'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <div className="px-6 pt-4 pb-2">
                            <h4 className="text-xl font-bold text-white mb-1 truncate">{event.title}</h4>
                            <p className="text-white/80 text-sm mb-2 line-clamp-2">{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-2">
                              <div className="flex items-center gap-1"><span className="font-medium">Location:</span> {event.location}</div>
                              <div className="flex items-center gap-1"><span className="font-medium">Category:</span> {event.category}</div>
                              <div className="flex items-center gap-1"><span className="font-medium">Organizer:</span> {event.createdBy?.name || 'Unknown'}</div>
                            </div>
                          </div>
                          {event.image && (
                            <div className="w-full flex justify-center items-center px-6 pb-2">
                              <img
                                src={event.image}
                                alt="Event image"
                                className="w-full max-h-40 object-cover rounded-2xl border border-white/20"
                                onError={(e) => (e.currentTarget.src = 'https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg')}
                              />
                            </div>
                          )}
                          <div className="flex gap-2 px-6 pb-6 pt-2">
                            <a
                              href={`/events/${event._id}`}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center transition-all duration-200 shadow-lg border border-blue-400/30"
                            >
                              View Details
                            </a>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => openAdminModal(event)}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center transition-all duration-200 shadow-lg border border-orange-400/30"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>

      {/* Admin Event Modal */}
      {showAdminModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAdminModal}></div>
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Event</h3>
              <button
                onClick={closeAdminModal}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="webinar">Webinar</option>
                    <option value="party">Party</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={editForm.startTime}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={editForm.endTime}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                    required
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    name="maxAttendees"
                    value={editForm.maxAttendees}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={editForm.contactEmail}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={editForm.contactPhone}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  value={editForm.requirements}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={editForm.image}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg border border-blue-400/30"
                >
                  {editLoading ? 'Updating...' : 'Update Event'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  disabled={deleteLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg border border-red-400/30"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 