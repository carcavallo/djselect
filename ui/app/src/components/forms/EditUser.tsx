import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotifier } from "../helpers/useNotifier";
import { fetchUserById, updateUserProfile } from "../helpers/apiService";

interface UserProfile {
  username: string;
  email: string;
  role: string;
  password?: string;
  user_id: string;
}

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userDetails, setUserDetails] = useState<UserProfile>({
    username: "",
    email: "",
    role: "",
    password: "",
    user_id: userId || "",
  });
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifier();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        const details = await fetchUserById(userId);
        setUserDetails({ ...details, password: "" });
      } catch (error) {
        notifyError("Failed to fetch user details");
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateUserProfile(userDetails.user_id, {
        ...userDetails,
        password: userDetails.password?.trim()
          ? userDetails.password
          : undefined,
      });
      notifySuccess("User updated successfully.");
      navigate("/dashboard");
    } catch (error) {
      notifyError("Failed to update user.");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
        Edit User
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Username"
            value={userDetails.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email"
            value={userDetails.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="New Password (optional)"
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="role" className="sr-only">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            value={userDetails.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="dj">DJ</option>
            <option value="event_manager">Event Manager</option>
          </select>
        </div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update User
        </button>
      </form>
      <div className="mt-2 text-center text-sm text-gray-600">
        <button
          onClick={() => navigate(-1)}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EditUser;
