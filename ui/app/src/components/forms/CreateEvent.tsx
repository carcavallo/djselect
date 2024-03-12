import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from '../useNotifier';
import Navigation from '../Navigation';

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState({
    organizer_id: user?.user_id || '',
    name: '',
    location: '',
    event_date: '',
    event_time: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventDetails({...eventDetails, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventDetails),
      });
      if (response.ok) {
        notifySuccess('Event created successfully.');
        setEventDetails({
          organizer_id: user?.user_id || '',
          name: '',
          location: '',
          event_date: '',
          event_time: '',
          description: ''
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to create event.');
      }
    } catch (error: any) {
      notifyError(error.message || 'An error occurred during event creation.');
    }
  };

  return (
    <>
        <Navigation />
        <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Create Event</h2>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <input
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Event Name"
                value={eventDetails.name}
                onChange={handleChange}
                />
                <input
                name="location"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Location"
                value={eventDetails.location}
                onChange={handleChange}
                />
                <input
                name="event_date"
                type="date"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={eventDetails.event_date}
                onChange={handleChange}
                />
                <input
                name="event_time"
                type="time"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={eventDetails.event_time}
                onChange={handleChange}
                />
                <textarea
                name="description"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Description"
                value={eventDetails.description}
                onChange={(e) => setEventDetails({...eventDetails, description: e.target.value})}
                rows={4}
                ></textarea>
                <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                Create Event
                </button>
            </form>
        </div>
    </>
  );
};

export default CreateEvent;
