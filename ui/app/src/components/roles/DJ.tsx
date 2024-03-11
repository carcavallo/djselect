import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
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
    case 'confirmed':
      return 'text-green-500';
    case 'pending':
      return 'text-yellow-500';
    case 'canceled':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const DJ: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  useEffect(() => {
    fetchEvents();
    if (user?.role === 'dj' && user.user_id) {
      fetchBookings(user.user_id);
    }
  }, [user?.user_id]);

  const fetchEvents = async () => {
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
        throw new Error('Failed to fetch events');
      }
    } catch (error: any) {
      notifyError(error.message || 'An error occurred while fetching events');
    }
  };
  
  const fetchBookings = async (djId: string) => {
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
  };
  
  const displayedEvents = events.map(event => {
    const booking = bookings.find(b => b.event_id === event.event_id);
    return { ...event, bookingStatus: booking ? booking.status : undefined };
  }).filter(event => {
    if (filter === 'booked') return event.bookingStatus === 'confirmed';
    if (filter === 'requested') return event.bookingStatus === 'pending';
    return true;
  });

  return (
    <div className="pt-16 sm:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Upcoming Events</h2>
        </div>
        <div className="flex justify-center gap-4 mb-6 text-white">
          <button onClick={() => setFilter('all')} className="btn">All Events</button>
          <button onClick={() => setFilter('booked')} className="btn">My Booked Events</button>
          <button onClick={() => setFilter('requested')} className="btn">My Requests</button>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {displayedEvents.map((event) => (
            <article 
              key={event.event_id}
              onClick={() => event.bookingStatus ? null : navigate(`/events/${event.event_id}`)}
              className={`relative isolate flex flex-col overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-20 sm:pt-48 lg:pt-20 ${event.bookingStatus ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <CalendarDaysIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold leading-6 text-white">{event.name}</h3>
              <p className="text-sm text-gray-500">{event.location}</p>
              <p className="text-sm text-gray-500">{formatDate(event.event_date)} at {formatTime(event.event_time)}</p>
              {event.bookingStatus && (
                <span className={`font-semibold ${getStatusColor(event.bookingStatus)}`}>
                  {event.bookingStatus.charAt(0).toUpperCase() + event.bookingStatus.slice(1)}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DJ;