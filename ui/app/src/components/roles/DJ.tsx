import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../AuthContext";
import { useNotifier } from "../useNotifier";
import { fetchEvents, fetchBookings, cancelBooking as cancelBookingService } from '../apiService';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Event {
  event_id: string;
  organizer_id: string;
  name: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  created_at: string;
  updated_at: string;
  bookingStatus?: 'confirmed' | 'pending' | 'cancelled';
}

interface Booking {
  booking_id: string;
  dj_id: string;
  event_id: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}. ${months[date.getMonth()]}`;
};

const getStatusColor = (status: 'confirmed' | 'pending' | 'cancelled'): string => {
  switch (status) {
    case "confirmed": return "text-green-500";
    case "pending": return "text-yellow-500";
    case "cancelled": return "text-red-500";
    default: return "";
  }
};

const DJ: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  useEffect(() => {
    const init = async () => {
      if (user?.role === 'dj' && user.user_id) {
        try {
          const eventsData = await fetchEvents();
          setEvents(eventsData);
          const bookingsData = await fetchBookings(user.user_id);
          setBookings(bookingsData);
        } catch (error: any) {
          notifyError(error.message || "An error occurred while fetching data");
        }
      }
    };
    init();
  }, [user?.role, user?.user_id]);

  const cancelBooking = async (eventId: string, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();
    const booking = bookings.find(b => b.event_id === eventId && b.dj_id === user?.user_id);
    if (!booking) return notifyError("Booking not found");

    try {
      await cancelBookingService(booking.booking_id);
      notifySuccess('Booking cancelled successfully');
      const updatedBookings = await fetchBookings(user?.user_id || "");
      setBookings(updatedBookings);
    } catch (error: any) {
      notifyError(error.message || "Failed to cancel booking");
    }
  };

  const displayedEvents = events.map(event => {
    if (bookings && bookings.length > 0) {
      const booking = bookings.find(b => b.event_id === event.event_id);
      return { ...event, bookingStatus: booking ? booking.status : undefined };
    }
    return event;
  }).filter(event => filter === 'all' || event.bookingStatus === filter);

  return (
    <div className="pt-16 sm:pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-center text-3xl leading-9 font-extrabold text-white">
            My DJ Events
          </h2>
          {events && events.length > 0 && bookings && bookings.length > 0 && (
            <div className="mt-8 flex text-white justify-center gap-4">
              <button 
                onClick={() => setFilter('all')} 
                className={`btn ${filter === 'all' ? 'underline' : ''}`}>
                All Events
              </button>
              <button 
                onClick={() => setFilter('confirmed')} 
                className={`btn ${filter === 'confirmed' ? 'underline' : ''}`}
                disabled={!bookings.some(b => b.status === 'confirmed')}>
                My Booked Events
              </button>
              <button 
                onClick={() => setFilter('pending')} 
                className={`btn ${filter === 'pending' ? 'underline' : ''}`}
                disabled={!bookings.some(b => b.status === 'pending')}>
                My Requests
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => (
            <div 
              key={event.event_id} 
              className={`bg-white rounded-lg shadow p-4 ${event.bookingStatus ? "cursor-not-allowed" : "cursor-pointer"}`} 
              onClick={() => event.bookingStatus ? null : navigate(`/events/${event.event_id}`)}>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-sm text-gray-500">{event.location}</p>
                <p className="text-sm text-gray-500 mb-2">{formatDate(event.start_datetime)} to {formatDate(event.end_datetime)}</p>
                <div className="flex items-center">
                  <span className={`font-semibold ${event.bookingStatus ? getStatusColor(event.bookingStatus) : "text-green-500"}`}>
                    {event.bookingStatus ? event.bookingStatus.charAt(0).toUpperCase() + event.bookingStatus.slice(1) : "Available"}
                  </span>
                  {event.bookingStatus === 'pending' && (
                    <XMarkIcon
                      onClick={(e) => {e.stopPropagation(); cancelBooking(event.event_id, e);}}
                      className="h-6 w-6 text-red-500 cursor-pointer"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {events && events.length === 0 && (
          <p className="mt-5 text-center text-lg text-gray-500">No events found. Please check back later.</p>
        )}
      </div>
    </div>
  );
};

export default DJ;