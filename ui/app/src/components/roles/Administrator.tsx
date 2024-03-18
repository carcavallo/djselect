import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUsers, deleteUser as deleteUserApi } from "../helpers/apiService";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNotifier } from "../helpers/useNotifier";

const Administrator: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotifier();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchUsers();
        const nonAdminUsers = fetchedUsers.filter(
          (user) => user.role !== "administrator"
        );
        setUsers(nonAdminUsers);
      } catch (error) {
        notifyError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserApi(userId);
      setUsers(users.filter((user) => user.user_id !== userId));
      notifySuccess("User deleted successfully");
    } catch (error) {
      notifyError("Failed to delete user");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl text-center sm:text-3xl text-white">
        User Management
      </h1>
      <div className="mt-4">
        {users.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between p-2 m-2 bg-white rounded shadow"
          >
            <div>
              <p>
                {user.username} ({user.role})
              </p>
              <p>{user.email}</p>
            </div>
            <div className="flex">
              <PencilIcon
                onClick={() => navigate(`/user/${user.user_id}`)}
                className="h-6 w-6 text-blue-500 cursor-pointer mr-2"
              />
              <TrashIcon
                onClick={() => deleteUser(user.user_id)}
                className="h-6 w-6 text-red-500 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Administrator;
