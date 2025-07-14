"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  createdBy: {
    name: string;
    email: string;
  };
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("This event doesn't exist or has been removed.");
        } else if (response.status === 400) {
          setError("Invalid event ID format.");
        } else {
          setError(data.error || "Failed to load event.");
        }
        return;
      }
      
      if (!data.event) {
        setError("Event not found in the database.");
        return;
      }
      
      setEvent(data.event);
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/Forest.jpeg')" }}>
        <div className="min-h-screen bg-black/50">
      <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Loading Event...</h1>
              <p className="text-white/70">Please wait while we fetch the event details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/Forest.jpeg')" }}>
        <div className="min-h-screen bg-black/50">
      <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
              <p className="text-white/70 mb-6">{error}</p>
              <p className="text-white/50 text-sm mb-6">This could happen if the event was deleted, the link is incorrect, or you don't have permission to view it.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg border border-blue-400/30"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </Link>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg border border-green-400/30"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View All Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/Forest.jpeg')" }}>
      <div className="min-h-screen bg-black/50">
        <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/80">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {event.startTime} - {event.endTime}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                event.status === 'upcoming' ? 'bg-green-500/20 text-green-200' :
                event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-200' :
                event.status === 'completed' ? 'bg-gray-500/20 text-gray-200' :
                'bg-red-500/20 text-red-200'
              }`}>
                {event.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
                <p className="text-white/90 leading-relaxed">{event.description}</p>
              </div>

              {event.image && (
                <div className="mb-6">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-2xl border border-white/20"
                    onError={(e) => (e.currentTarget.src = 'https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg')}
            />
          </div>
              )}

              {event.requirements && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-4">Requirements</h2>
                  <p className="text-white/90 leading-relaxed">{event.requirements}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Event Details</h3>
                <div className="space-y-4">
              <div>
                    <span className="text-white/70 text-sm">Location</span>
                    <p className="text-white font-medium">{event.location}</p>
              </div>
              <div>
                    <span className="text-white/70 text-sm">Organizer</span>
                    <p className="text-white font-medium">{event.createdBy.name}</p>
                  </div>
                  {event.maxAttendees && (
                    <div>
                      <span className="text-white/70 text-sm">Max Attendees</span>
                      <p className="text-white font-medium">{event.maxAttendees}</p>
                    </div>
                  )}
                  {event.price !== undefined && (
                    <div>
                      <span className="text-white/70 text-sm">Price</span>
                      <p className="text-white font-medium">${event.price}</p>
                    </div>
                  )}
                </div>
              </div>

              {(event.contactEmail || event.contactPhone) && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {event.contactEmail && (
                      <div>
                        <span className="text-white/70 text-sm">Email</span>
                        <p className="text-white font-medium">{event.contactEmail}</p>
                      </div>
                    )}
                    {event.contactPhone && (
                      <div>
                        <span className="text-white/70 text-sm">Phone</span>
                        <p className="text-white font-medium">{event.contactPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 