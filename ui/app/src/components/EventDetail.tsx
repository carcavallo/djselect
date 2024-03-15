import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import { useAuth } from "./AuthContext";
import { useNotifier } from "./useNotifier";

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

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!eventId) return;
      try {
        const response = await fetch(`http://localhost/api/events/${eventId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success" && data.data.length > 0) {
          setEvent(data.data[0]);
        } else {
          console.error("Failed to fetch event details:", data.message);
          notifyError("Failed to fetch event details.");
        }
      } catch (error) {
        console.error("An error occurred while fetching event details:", error);
        notifyError("An error occurred while fetching event details.");
      }
    };

    fetchEventDetail();
  }, [eventId, notifyError]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eventId) return;

    try {
      const response = await fetch("http://localhost/api/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          event_id: eventId,
          dj_id: user.user_id,
          status: "pending",
        }),
      });

      if (response.ok) {
        notifySuccess("Booking request sent successfully!");
        navigate("/dashboard");
      } else {
        notifyError("Failed to send booking request.");
      }
    } catch (error) {
      console.error("Error sending booking request:", error);
      notifyError("An error occurred while sending the booking request.");
    }
  };

  if (!event) return <></>;

  return (
    <>
      <Navigation />
      <div className="py-12 px-4 sm:px-6 lg:py-16 lg:px-8 rounded-lg shadow-md text-white">
        <div className="text-center mb-8">
          <CalendarDaysIcon
            className="mx-auto h-10 w-10 text-indigo-400"
            aria-hidden="true"
          />
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
            {event.name}
          </h2>
          <p className="mt-4 max-w-2xl text-xl mx-auto">
            {formatDate(event.event_date)} at {formatTime(event.event_time)}
          </p>
        </div>
        <p className="text-md text-center mb-4">Location: {event.location}</p>
        <p className="text-md text-center mb-4">{event.description}</p>
        {user && user.role === "dj" && (
          <form
            onSubmit={handleBookingSubmit}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="flex flex-col items-center justify-center">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Booking Request
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EventDetail;
