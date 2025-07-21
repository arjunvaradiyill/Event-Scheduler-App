"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
    name: string;
    email: string;
  };
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading event...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-blue-900/60 relative">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl z-0" />
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white drop-shadow">{event.title}</h1>
            <Link href="/dashboard" className="text-indigo-200 hover:text-indigo-400 font-medium transition-colors">Back</Link>
          </div>
          <div className="flex justify-center mb-6">
            <img
              src={event.image || "https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg"}
              alt="Event image"
              className="w-full max-h-64 object-cover rounded-2xl shadow-lg border border-white/20"
              onError={(e) => (e.currentTarget.src = "https://i.pinimg.com/1200x/38/b9/b4/38b9b44a1b38b3831ae4353e2cf48764.jpg")}
            />
          </div>
          <div className="space-y-4 text-white/90">
            <p className="text-lg font-medium">{event.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><span className="font-semibold">Time:</span> {event.time} ({event.duration || 120} min)</p>
                <p><span className="font-semibold">Location:</span> {event.location}</p>
                <p><span className="font-semibold">Category:</span> {event.category}</p>
                <p><span className="font-semibold">Status:</span> {event.status}</p>
              </div>
              <div>
                <p><span className="font-semibold">Organizer:</span> {event.organizer?.name}</p>
                {event.maxAttendees && <p><span className="font-semibold">Max Attendees:</span> {event.maxAttendees}</p>}
                {event.price && <p><span className="font-semibold">Price:</span> ${event.price}</p>}
                {event.contactEmail && <p><span className="font-semibold">Contact Email:</span> {event.contactEmail}</p>}
                {event.contactPhone && <p><span className="font-semibold">Contact Phone:</span> {event.contactPhone}</p>}
                {event.requirements && <p><span className="font-semibold">Requirements:</span> {event.requirements}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 