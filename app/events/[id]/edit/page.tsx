'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import ErrorPopup from '../../../components/ErrorPopup';
import SuccessPopup from '../../../components/SuccessPopup';

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
}

export default function EditEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupData, setErrorPopupData] = useState({ title: '', message: '', type: 'error' as 'error' | 'warning' | 'info' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupData, setSuccessPopupData] = useState({ title: '', message: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    status: 'upcoming',
    maxAttendees: '',
    price: '',
    contactEmail: '',
    contactPhone: '',
    requirements: '',
    image: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchEvent();
  }, [user, eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Event not found');
      }
      const data = await response.json();
      const eventData = data.event;
      // No organizer check needed
      setEvent(eventData);
      setFormData({
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date).toISOString().split('T')[0],
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
        location: eventData.location,
        category: eventData.category,
        status: eventData.status,
        maxAttendees: eventData.maxAttendees?.toString() || '',
        price: eventData.price?.toString() || '',
        contactEmail: eventData.contactEmail || '',
        contactPhone: eventData.contactPhone || '',
        requirements: eventData.requirements || '',
        image: eventData.image || '',
      });
    } catch (error) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error types with friendly messages
        if (errorData.error && errorData.error.includes('Event time conflict')) {
          setErrorPopupData({
            title: 'Time Conflict',
            message: 'You already have an event scheduled at this time. Please choose a different time or date to avoid conflicts.',
            type: 'warning'
          });
          setShowErrorPopup(true);
        } else {
          setErrorPopupData({
            title: 'Error',
            message: errorData.error || 'Failed to update event. Please try again.',
            type: 'error'
          });
          setShowErrorPopup(true);
        }
        return;
      }

      setSuccessPopupData({
        title: 'Event Updated Successfully!',
        message: 'Your event has been updated and the changes are now visible on the dashboard. You will be redirected to the dashboard shortly.'
      });
      setShowSuccessPopup(true);
      
      // Redirect after popup closes
      setTimeout(() => {
        router.push('/dashboard?refresh=1');
      }, 2500);
    } catch (error: any) {
      setErrorPopupData({
        title: 'Error',
        message: error.message || 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setShowErrorPopup(true);
    }
  };

  const handleDelete = async () => {
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
        const errorData = await response.json();
        setErrorPopupData({
          title: 'Error',
          message: errorData.error || 'Failed to delete event. Please try again.',
          type: 'error'
        });
        setShowErrorPopup(true);
        return;
      }

      setSuccessPopupData({
        title: 'Event Deleted Successfully!',
        message: 'Your event has been deleted from the dashboard. You will be redirected to the dashboard shortly.'
      });
      setShowSuccessPopup(true);
      
      // Redirect after popup closes
      setTimeout(() => {
        router.push('/dashboard?refresh=1');
      }, 2500);
    } catch (error: any) {
      setErrorPopupData({
        title: 'Error',
        message: error.message || 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setShowErrorPopup(true);
    }
  };

  if (loading) {
    return null;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-blue-900/60 relative">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl z-0" />
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow">Edit Event</h1>
            <Link
              href="/dashboard"
              className="text-indigo-200 hover:text-indigo-400 font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-white/80 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Event Title"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-white/80 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-white/80 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-semibold text-white/80 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-semibold text-white/80 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="location" className="block text-sm font-semibold text-white/80 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                />
              </div>
              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-semibold text-white/80 mb-1">
                  Max Attendees
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  min="1"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="Max Attendees"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-white/80 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                />
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-white/80 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Contact Email"
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-semibold text-white/80 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Contact Phone"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-white/80 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-semibold text-white/80 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Paste an image URL (e.g. https://...)"
                />
                {formData.image && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={formData.image}
                      alt="Event preview"
                      className="max-h-48 rounded-2xl shadow-lg border border-white/20 object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white/80 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event Description"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-semibold text-white/80 mb-1">
                Special Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                className="mt-1 block w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Any special requirements?"
                rows={2}
              />
            </div>
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Delete Event
              </button>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Update Event
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title={errorPopupData.title}
        message={errorPopupData.message}
        type={errorPopupData.type}
      />
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title={successPopupData.title}
        message={successPopupData.message}
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
} 