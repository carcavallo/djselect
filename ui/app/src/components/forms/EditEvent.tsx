import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNotifier } from '../useNotifier';
import Navigation from '../Navigation';

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();
  const [dataFetched, setDataFetched] = useState(false); // State to track if data has been fetched
  const [eventDetails, setEventDetails] = useState({
    organizer_id: '',
    name: '',
    location: '',
    event_date: '',
    event_time: '',
    description: ''
  });

  useEffect(() => {
    if (!dataFetched) { // Fetch data only if it hasn't been fetched yet
      const fetchEventDetails = async () => {
        try {
          const response = await fetch(`http://localhost/api/events/${eventId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            const { data } = await response.json();
            if (data && data.length > 0) {
              setEventDetails({
                ...data[0],
                event_date: data[0].event_date.split('T')[0], // Assuming ISO format
                event_time: data[0].event_time.slice(0, 5) // Assuming HH:MM:SS format
              });
              setDataFetched(true); // Mark data as fetched
            } else {
              throw new Error('Event not found.');
            }
          } else {
            throw new Error('Failed to fetch event details.');
          }
        } catch (error: any) {
          notifyError(error.message || 'An error occurred while fetching event details.');
        }
      };
  
      fetchEventDetails();
    }
  }, [eventId, notifyError, dataFetched]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventDetails(prevState => ({
        ...prevState,
        [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventDetails),
      });
      if (response.ok) {
        notifySuccess('Event updated successfully.');
        navigate('/dashboard'); // Adjust the navigation as needed
      } else {
        throw new Error('Failed to update event.');
      }
    } catch (error: any) {
      notifyError(error.message || 'An error occurred during event update.');
    }
  };

  return (
    <>
        <Navigation />
        <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Edit Event</h2>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {/* Form fields */}
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
                placeholder="Event Date"
                value={eventDetails.event_date}
                onChange={handleChange}
                />
                <input
                name="event_time"
                type="time"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Event Time"
                value={eventDetails.event_time}
                onChange={handleChange}
                />
                <textarea
                name="description"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Description"
                value={eventDetails.description}
                onChange={handleChange}
                rows={4}
                ></textarea>
                <button 
                type="submit" 
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                Update Event
                </button>
            </form>
        </div>
    </>
  );
};

export default EditEvent;
