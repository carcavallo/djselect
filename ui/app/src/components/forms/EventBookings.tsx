import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import { CheckIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Navigation from "../Navigation";
import {
  fetchBookingsForEvent,
  updateBookingStatus,
  fetchUserById,
} from "../helpers/apiService";

interface Booking {
  booking_id: string;
  dj_id: string;
  status: string;
  djUsername?: string;
}

const EventBookings: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { notifyError, notifySuccess } = useNotifier();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        let bookingsData = await fetchBookingsForEvent(eventId);
        bookingsData = bookingsData ?? [];
        setHasConfirmedBooking(
          bookingsData.some((booking) => booking.status === "confirmed")
        );
        const bookingsWithUsernames = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const userData = await fetchUserById(booking.dj_id);
              return { ...booking, djUsername: userData.username };
            } catch (error) {
              return { ...booking, djUsername: "Unknown DJ" };
            }
          })
        );
        setBookings(bookingsWithUsernames);
      } catch (error: any) {
        notifyError(
          error.message || "An error occurred while fetching bookings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [eventId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "confirmed" | "cancelled"
  ) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      notifySuccess(`Booking ${newStatus}`);
      setBookings(
        bookings?.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      if (newStatus === "confirmed") {
        setHasConfirmedBooking(true);
      }
    } catch (error) {
      notifyError(`Failed to ${newStatus} booking`);
    }
  };

  return (
    <>
      <Navigation />
      <div className="pt-16 sm:pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-center text-3xl leading-9 font-extrabold text-white">
              Booking Requests for Event
            </h2>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : bookings && bookings.length > 0 ? (
            <div className="flex flex-col mt-5">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Username
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings &&
                          bookings.map((booking) => (
                            <tr key={booking.booking_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.djUsername}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.status}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {!hasConfirmedBooking && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          booking.booking_id,
                                          "confirmed"
                                        )
                                      }
                                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                      <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          booking.booking_id,
                                          "cancelled"
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <XCircleIcon className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 mb-6 text-center text-lg text-gray-500">
              No booking requests found for this event.
            </p>
          )}
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
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

export default EventBookings;
