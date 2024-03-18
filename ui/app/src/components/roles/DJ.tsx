import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../authentication/AuthContext";
import { useNotifier } from "../helpers/useNotifier";
import {
  fetchEvents,
  fetchBookings,
  cancelBooking as cancelBookingService,
} from "../helpers/apiService";

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
  created_at: string;
  updated_at: string;
  bookingStatus?: "confirmed" | "pending" | "cancelled";
}

interface Booking {
  booking_id: string;
  dj_id: string;
  event_id: string;
  status: "confirmed" | "pending" | "cancelled";
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}. ${months[date.getMonth()]}`;
};

const getStatusColor = (
  status: "confirmed" | "pending" | "cancelled"
): string => {
  switch (status) {
    case "confirmed":
      return "text-green-500";
    case "pending":
      return "text-yellow-500";
    case "cancelled":
      return "text-red-500";
    default:
      return "";
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
      if (user?.role === "dj" && user.user_id) {
        try {
          const eventsData = await fetchEvents();
          setEvents(eventsData);
          const bookingsData = await fetchBookings(user.user_id);
          setBookings(bookingsData || []);
        } catch (error: any) {
          notifyError(error.message || "An error occurred while fetching data");
        }
      }
    };
    init();
  }, [user?.role, user?.user_id]);

  const cancelBooking = async (
    eventId: string,
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) => {
    e.stopPropagation();
    const booking = bookings.find(
      (b) => b.event_id === eventId && b.dj_id === user?.user_id
    );
    if (!booking) return notifyError("Booking not found");

    try {
      await cancelBookingService(booking.booking_id);
      notifySuccess("Booking cancelled successfully");
      const updatedBookings = await fetchBookings(user?.user_id || "");
      setBookings(updatedBookings);
    } catch (error: any) {
      notifyError(error.message || "Failed to cancel booking");
    }
  };

  const hasPending = bookings.some((b) => b.status === "pending");
  const hasConfirmed = bookings.some((b) => b.status === "confirmed");

  const displayedEvents = events
    .map((event) => {
      if (bookings && bookings.length > 0) {
        const booking = bookings.find((b) => b.event_id === event.event_id);
        return {
          ...event,
          bookingStatus: booking ? booking.status : undefined,
        };
      }
      return event;
    })
    .filter((event) => filter === "all" || event.bookingStatus === filter);

  return (
    <div className="pt-16 sm:pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-center text-3xl leading-9 font-extrabold text-white">
            My DJ Events
          </h2>
          {(hasPending || hasConfirmed) && (
            <div className="mt-8 flex text-white justify-center gap-4">
              {/* Apply cursor-pointer to buttons */}
              <button
                onClick={() => setFilter("all")}
                className={`btn cursor-pointer ${
                  filter === "all" ? "underline" : ""
                }`}
              >
                All Events
              </button>
              {hasPending && (
                <button
                  onClick={() => setFilter("pending")}
                  className={`btn cursor-pointer ${
                    filter === "pending" ? "underline" : ""
                  }`}
                >
                  My Requests
                </button>
              )}
              {hasConfirmed && (
                <button
                  onClick={() => setFilter("confirmed")}
                  className={`btn cursor-pointer ${
                    filter === "confirmed" ? "underline" : ""
                  }`}
                >
                  My Booked Events
                </button>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => (
            <div
              key={event.event_id}
              // Apply cursor-pointer to indicate clickable
              className="bg-white rounded-lg shadow p-4 h-36 w-72 flex flex-col justify-between cursor-pointer"
              onClick={() =>
                event.bookingStatus
                  ? null
                  : navigate(`/events/${event.event_id}`)
              }
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-500">{event.location}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(event.start_datetime)}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`font-semibold ${
                    event.bookingStatus
                      ? getStatusColor(event.bookingStatus)
                      : "text-green-500"
                  }`}
                >
                  {event.bookingStatus
                    ? event.bookingStatus.charAt(0).toUpperCase() +
                      event.bookingStatus.slice(1)
                    : "Available"}
                </span>
                {event.bookingStatus === "pending" && (
                  <XMarkIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelBooking(event.event_id, e);
                    }}
                    className="h-6 w-6 text-red-500 cursor-pointer ml-2"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        {events && events.length === 0 && (
          <p className="mt-5 text-center text-lg text-gray-500">
            No events found. Please check back later.
          </p>
        )}
      </div>
    </div>
  );
};

export default DJ;
