import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../AuthContext';
import { useNotifier } from '../useNotifier';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day}. ${month}`;
};

const formatTime = (timeString: string) => {
  return timeString.substring(0, 5);
};

interface Event {
  event_id: string;
  organizer_id: string;
  name: string;
  location: string;
  event_date: string;
  event_time: string;
  description: string;
  created_at: string;
  updated_at: string;
  bookingStatus?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'text-green-500';
    case 'pending': return 'text-yellow-500';
    case 'cancelled': return 'text-red-500';
    default: return '';
  }
};

const DJ: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost/api/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      } else {
        throw new Error('No events found');
      }
    } catch (error: any) {
      notifyError(error.message || 'An error occurred while fetching events');
    }
  }, [notifyError]);

  const fetchBookings = useCallback(async (djId: string) => {
    try {
      const response = await fetch(`http://localhost/api/bookings/${djId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data);
      } else {
        return;
      }
    } catch (error: any) {
      return;
    }
  }, []);

  const cancelBooking = async (eventId: string, event: any) => {
    event.stopPropagation();
    try {
      const bookingsResponse = await fetch(`http://localhost/api/boevents/${eventId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!bookingsResponse.ok) throw new Error('Failed to fetch bookings for the event');
  
      const { data: bookingsData } = await bookingsResponse.json();
      const userBooking = bookingsData.find((booking: any) => booking.dj_id === user?.user_id);
      if (!userBooking) throw new Error("Booking not found for the current user.");
  
      const cancelResponse = await fetch(`http://localhost/api/bookings/${userBooking.booking_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "cancelled" }),
        credentials: 'include',
      });
      if (!cancelResponse.ok) throw new Error('Failed to cancel booking');
  
      notifySuccess('Booking request cancelled successfully.');
  
      const updatedBookings = bookings.map(booking => 
        booking.booking_id === userBooking.booking_id ? { ...booking, status: "cancelled" } : booking
      );
      setBookings(updatedBookings);
  
      const updatedEvents = events.map(event => 
        event.event_id === eventId ? { ...event, bookingStatus: "cancelled" } : event
      );
      setEvents(updatedEvents);
    } catch (error: any) {
      notifyError(error.message || 'An error occurred while cancelling the booking');
    }
  };  

  useEffect(() => {
    if (user?.role === 'dj' && user.user_id) {
      fetchEvents();
      fetchBookings(user.user_id);
    }
  }, [user?.role, user?.user_id]);
  
  const displayedEvents = events.map(event => {
    const booking = bookings.find(b => b.event_id === event.event_id);
    return { ...event, bookingStatus: booking ? booking.status : undefined };
  }).filter(event => {
    if (filter === 'booked') return event.bookingStatus === 'confirmed';
    if (filter === 'requested') return event.bookingStatus === 'pending';
    return true;
  });

  return (
    <div className="pt-16 sm:pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-center text-3xl leading-9 font-extrabold text-white">
            My DJ Events
          </h2>
          {events.length > 0 && (
            <div className="mt-8 flex text-white justify-center gap-4">
              <button 
                onClick={() => setFilter('all')} 
                className={`btn ${filter === 'all' ? 'underline' : ''}`}>
                All Events
              </button>
              {bookings.some(b => b.status === 'confirmed') && (
                <button 
                  onClick={() => setFilter('booked')} 
                  className={`btn ${filter === 'booked' ? 'underline' : ''}`}>
                  My Booked Events
                </button>
              )}
              {bookings.some(b => b.status === 'pending') && (
                <button 
                  onClick={() => setFilter('requested')} 
                  className={`btn ${filter === 'requested' ? 'underline' : ''}`}>
                  My Requests
                </button>
              )}
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
                <p className="text-sm text-gray-500 mb-2">{formatDate(event.event_date)} at {formatTime(event.event_time)}</p>
                <div className="flex justify-between items-center">
                  {event.bookingStatus && (
                    <span className={`font-semibold ${getStatusColor(event.bookingStatus)}`}>
                      {event.bookingStatus.charAt(0).toUpperCase() + event.bookingStatus.slice(1)}
                    </span>
                  )}
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
        {events.length === 0 && (
          <p className="mt-5 text-center text-lg text-gray-500">No events found. Please check back later.</p>
        )}
      </div>
    </div>
  );
};

export default DJ;