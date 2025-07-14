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

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Event not found");
      }
      const data = await response.json();
      setEvent(data.event);
    } catch (err: any) {
      setError(err.message || "Failed to load event");
    }
  };

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{error || "Event not found"}</h1>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-200 font-medium">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
  );
} 