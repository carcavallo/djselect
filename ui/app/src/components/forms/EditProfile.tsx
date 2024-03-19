import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";
import { useNotifier } from "../helpers/useNotifier";
import Navigation from "../Navigation";
import { fetchUserProfile, updateUserProfile } from "../helpers/apiService";

interface UserProfile {
  username: string;
  email: string;
  password?: string;
  role: string;
  user_id: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notifyError, notifySuccess } = useNotifier();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const profile = await fetchUserProfile();
          setUserProfile({
            user_id: profile.user_id,
            username: profile.username,
            email: profile.email,
            role: profile.role,
          });
        } catch (error: any) {
          notifyError(error.message || "Failed to load profile data.");
        }
      }
    };

    loadUserProfile();
  }, [isAuthenticated]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, [name]: value } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userProfile) {
      notifyError("No profile information to update.");
      return;
    }

    const profileToUpdate: UserProfile = {
      ...userProfile,
      password: userProfile.password?.trim() ? userProfile.password : undefined,
    };

    try {
      await updateUserProfile(profileToUpdate.user_id, profileToUpdate);
      notifySuccess("Profile updated successfully.");
      navigate("/");
    } catch (error: any) {
      notifyError(
        error.message || "An error occurred during the profile update."
      );
    }
  };

  if (!userProfile) return <></>;

  return (
    <>
      <Navigation />
      <div className="max-w-md mx-auto w-full space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Edit Your Profile
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                name="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
                placeholder="Username"
                value={userProfile.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
                placeholder="Email"
                value={userProfile.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm min-h-[50px]"
                placeholder="New Password (optional)"
                value={userProfile.password || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
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

export default EditProfile;
