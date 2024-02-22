<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\User;
use trait\getter;

class UsersController extends IOController
{
    use getter;

    /**
     * Fetches and returns all users.
     * @return void
     */
    public function getUsers(): void
    {
        try {
            $users = DataRepo::of(User::class)->select();
            $this->sendResponse("success", "Users retrieved successfully", $users);
        } catch (Exception $e) {
            $this->sendResponse("error", "Failed to retrieve users", null, 500);
        }
    }

    /**
     * Retrieves a user based on the provided user ID.
     * @param string $userId The unique identifier of the user to retrieve.
     * @return void
     */
    public function getUser(string $userId): void
    {
        try {
            $user = DataRepo::of(User::class)->select(
                where: ['user_id' => ['=' => $userId]]
            );

            if (empty($user)) {
                $this->sendResponse("error", "User not found", null, 404);
                return;
            }

            $this->sendResponse("success", "User retrieved successfully", $user[0]->toArray());
        } catch (Exception $e) {
            $this->sendResponse("error", "Failed to retrieve user", null, 500);
        }
    }

    /**
     * Retrieves session data for the current logged-in user.
     * Note: This function assumes the user's ID is stored in the session upon login.
     * @return array|null The session data for the current user or null if not logged in.
     */
    public function getUserSession()
    {
        if (isset($_SESSION['user_id'])) {
            $sessionData = [
                'user_id' => $_SESSION['user_id'],
            ];

            $this->sendResponse("success", "User Session retrieved successfully", $sessionData);
        }

        $this->sendResponse("error", "Failed to retrieved User session", $sessionData);
    }

    /**
     * Updates an existing user with the details provided in the request body.
     * @param string $userId The unique identifier of the user to be updated.
     * @return void
     */
    public function updateUser(string $userId): void
    {
        try {
            $user = DataRepo::of(User::class)->select(
                where: ['user_id' => ['=' => $userId]]
            );

            if (empty($user)) {
                $this->sendResponse("error", "User not found", null, 404);
                return;
            }

            $user = $user[0];
            foreach ($_POST as $key => $value) {
                if (property_exists($user, $key) && !in_array($key, ['user_id', 'created_at', 'updated_at'])) {
                    $user->$key = $value;
                }
            }

            if (!DataRepo::update($user)) {
                $this->sendResponse("error", "Failed to update user", null, 500);
            } else {
                $this->sendResponse("success", "User updated successfully");
            }
        } catch (Exception $e) {
            $this->sendResponse("error", "Failed to update user", null, 500);
        }
    }

    /**
     * Deletes a user based on the provided user ID.
     * @param string $userId The unique identifier of the user to be deleted.
     * @return void
     */
    public function deleteUser(string $userId): void
    {
        try {
            $user = DataRepo::of(User::class)->select(
                where: ['user_id' => ['=' => $userId]]
            );

            if (empty($user)) {
                $this->sendResponse("error", "User not found", null, 404);
                return;
            }

            if (DataRepo::delete($user[0])) {
                $this->sendResponse("success", "User deleted successfully");
            } else {
                $this->sendResponse("error", "Failed to delete user", null, 500);
            }
        } catch (Exception $e) {
            $this->sendResponse("error", "Failed to delete user", null, 500);
        }
    }
}
