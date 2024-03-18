import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import Navigation from "../Navigation";
import { fetchEventDetails, updateEvent } from "../helpers/apiService";

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotifier();
  const [dataFetched, setDataFetched] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    organizer_id: "",
    name: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    description: "",
  });

  useEffect(() => {
    if (!dataFetched && eventId) {
      fetchEventDetails(eventId)
        .then((data) => {
          setEventDetails({
            organizer_id: data.organizer_id,
            name: data.name,
            location: data.location,
            start_datetime: data.start_datetime,
            end_datetime: data.end_datetime,
            description: data.description,
          });
          setDataFetched(true);
        })
        .catch((error: any) =>
          notifyError(
            error.message || "An error occurred while fetching event details."
          )
        );
    }
  }, [eventId, notifyError, dataFetched]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEventDetails((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (eventId) {
      updateEvent(eventId, eventDetails)
        .then(() => {
          notifySuccess("Event updated successfully.");
          navigate("/dashboard");
        })
        .catch((error: any) =>
          notifyError(error.message || "An error occurred during event update.")
        );
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Edit Event
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
            placeholder="Event Date"
            value={eventDetails.start_datetime}
            onChange={handleChange}
          />
          <input
            name="end_datetime"
            type="datetime-local"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Event Time"
            value={eventDetails.end_datetime}
            onChange={handleChange}
          />
          <textarea
            name="description"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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

export default EditEvent;
