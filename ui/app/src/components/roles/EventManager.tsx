import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../authentication/AuthContext";
import { useNotifier } from "../helpers/useNotifier";
import { fetchUserEvents, deleteEvent } from "../helpers/apiService";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Event {
  event_id: string;
  organizer_id: string;
  name: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}. ${months[date.getMonth()]}`;
};

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  useEffect(() => {
    if (user?.user_id) {
      fetchUserEvents(user.user_id)
        .then((events) => {
          if (events && events.length === 0) {
            setEvents([]);
          } else {
            setEvents(events);
          }
        })
        .catch((error: any) => {
          notifyError(
            error.message || "An error occurred while fetching events"
          );
        });
    }
  }, [user?.user_id]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.event_id !== eventId)
      );
      notifySuccess("Event deleted successfully");
    } catch (error: any) {
      notifyError(
        error.message || "An error occurred while deleting the event"
      );
    }
  };

  return (
    <div className="pt-16 sm:pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-center text-3xl leading-9 font-extrabold text-white">
            My Created Events
          </h2>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/create-event")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Event
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events &&
            events.map((event) => (
              <div
                key={event.event_id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500">{event.location}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(event.start_datetime)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <PencilSquareIcon
                      className="h-6 w-6 text-gray-400 cursor-pointer"
                      onClick={() => navigate(`/edit-event/${event.event_id}`)}
                      aria-hidden="true"
                    />
                    <ClipboardDocumentCheckIcon
                      className="h-6 w-6 text-gray-400 cursor-pointer"
                      onClick={() =>
                        navigate(`/event-requests/${event.event_id}`)
                      }
                      aria-hidden="true"
                    />
                    <TrashIcon
                      className="h-6 w-6 text-gray-400 cursor-pointer"
                      onClick={() => handleDeleteEvent(event.event_id)}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
        {!events && (
          <p className="mt-5 text-center text-lg text-gray-500">
            No events found. Start by creating a new event.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventManager;
