import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import Navigation from "../Navigation";
import { useAuth } from "../authentication/AuthContext";
import { useNotifier } from "../helpers/useNotifier";
import { fetchEventDetail, sendBookingRequest } from "../helpers/apiService";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}. ${date.toLocaleString("default", {
    month: "long",
  })} ${date.getFullYear()} (${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")})`;
};

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
}

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();

  useEffect(() => {
    if (eventId) {
      fetchEventDetail(eventId)
        .then((event) => setEvent(event))
        .catch((error) => notifyError(error.message));
    }
  }, [eventId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookingSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || !eventId) return;

    sendBookingRequest({ eventId, djId: user.user_id })
      .then(() => {
        notifySuccess("Booking request sent successfully!");
        navigate("/dashboard");
      })
      .catch((error) => notifyError(error.message));
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
            {formatDate(event.start_datetime)} -{" "}
            {formatDate(event.end_datetime)}
          </p>
        </div>
        <p className="text-md text-center mb-4">Location: {event.location}</p>
        <p className="text-md text-center mb-4">{event.description}</p>
        {user && user.role === "dj" && (
          <form
            onSubmit={handleBookingSubmit}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="flex flex-col items-center justify-center mb-4">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Booking Request
              </button>
            </div>
          </form>
        )}
        <div className="text-center text-sm text-gray-600">
          <button
            onClick={handleBack}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
};

export default EventDetail;
