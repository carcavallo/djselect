import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../AuthContext";
import { useNotifier } from "../useNotifier";

interface Event {
  event_id: string;
  organizer_id: string;
  name: string;
  location: string;
  event_date: string;
  event_time: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError } = useNotifier();

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost/api/usevents/${user?.user_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setEvents(result.data);
        } else {
          throw new Error("Unexpected response structure");
        }
      } else {
        throw new Error("Failed to fetch events");
      }
    } catch (error: any) {
      notifyError(error.message || "An error occurred while fetching events");
      setEvents([]);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`http://localhost/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setEvents((currentEvents) =>
          currentEvents.filter((event) => event.event_id !== eventId)
        );
        notifyError("Event deleted successfully");
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error: any) {
      notifyError(
        error.message || "An error occurred while deleting the event"
      );
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.user_id]);

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
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.name}
                </h3>
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
                    onClick={() => deleteEvent(event.event_id)}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-white">
              No events found. Start by creating a new event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventManager;
