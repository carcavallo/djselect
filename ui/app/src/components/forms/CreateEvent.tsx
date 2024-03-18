import React, { useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import Navigation from "../Navigation";
import { createEvent } from "../helpers/apiService";

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState({
    organizer_id: user?.user_id || "",
    name: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    description: "",
  });

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      new Date(eventDetails.end_datetime) <=
      new Date(eventDetails.start_datetime)
    ) {
      notifyError(
        "The end date and time must be after the start date and time."
      );
      return;
    }

    try {
      await createEvent(eventDetails);
      notifySuccess("Event created successfully.");
      navigate("/dashboard");
    } catch (error: any) {
      notifyError(error.message || "An error occurred during event creation.");
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create Event
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Event Name"
            value={eventDetails.name}
            onChange={handleChange}
          />
          <input
            name="location"
            type="text"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Location"
            value={eventDetails.location}
            onChange={handleChange}
          />
          <input
            name="start_datetime"
            type="datetime-local"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            min={getMinDateTime()}
            value={eventDetails.start_datetime}
            onChange={handleChange}
          />
          <input
            name="end_datetime"
            type="datetime-local"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            min={getMinDateTime()}
            value={eventDetails.end_datetime}
            onChange={handleChange}
          />
          <textarea
            name="description"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Description"
            value={eventDetails.description}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, description: e.target.value })
            }
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </button>
        </form>
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

export default CreateEvent;
