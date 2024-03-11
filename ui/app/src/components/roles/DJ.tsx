import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

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
}

const DJ: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost/api/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        if (data.status === 'success') {
          setEvents(data.data);
        } else {
          console.error('Failed to fetch events:', data.message);
        }
      } catch (error) {
        console.error('An error occurred while fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Upcoming Events</h2>
          <p className="mt-2 text-lg leading-8 text-gray-300">
            Check out the latest events and join us!
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {events.map((event) => (
            <article key={event.event_id} className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-20 sm:pt-48 lg:pt-20">
              <CalendarDaysIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                {event.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{event.location}</p>
              <p className="mt-1 text-sm text-gray-500">{formatDate(event.event_date)} at {formatTime(event.event_time)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DJ;
