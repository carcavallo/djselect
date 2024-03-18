<?php

namespace controller;

use lib\DataRepo\DataRepo;
use model\User;
use trait\getter;
use function util\removeArrayKeys;

class UsersController extends IOController
{
    use getter;

    /**
     * Retrieves all users.
     * @return void
     */
    public function getUsers(): void
    {
        $users = DataRepo::of(User::class)->select();
        
        if (empty($users)) {
            $this->sendResponse("error", "No users found", null, 404);
        } else {
            $this->sendResponse("success", "Users retrieved successfully", $users);
        }
    }

    /**
     * Retrieves a user based on the provided user ID.
     * @param string $userId The unique identifier of the user to retrieve.
     * @return void
     */
    public function getUser(string $userId): void
    {
        $user = $this->_getUser($userId);
        $this->sendResponse("success", "User retrieved successfully", removeArrayKeys($user->toArray(), ['password', 'reset_token', 'reset_token_expires']));
    }

    /**
     * Updates an existing user with the details provided in the request body.
     * @param string $userId The unique identifier of the user to be updated.
     * @return void
     */
    public function updateUser(string $userId): void
    {
        $user = $this->_getUser($userId);

        if (isset($_POST["password"]) && !empty(trim($_POST["password"]))) {
            $_POST["password"] = password_hash($_POST["password"], PASSWORD_DEFAULT);
        } else {
            unset($_POST["password"]);
        }
        
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
    }

    /**
     * Deletes a user based on the provided user ID.
     * @param string $userId The unique identifier of the user to be deleted.
     * @return void
     */
    public function deleteUser(string $userId): void
    {
        $user = $this->_getUser($userId);

        if (DataRepo::delete($user)) {
            $this->sendResponse("success", "User deleted successfully");
        } else {
            $this->sendResponse("error", "Failed to delete user", null, 500);
        }
    }
}
