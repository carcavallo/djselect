<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\User;

class UserController extends IOController
{
    public function createUser(): void
    {
        $this->checkPostArguments(['username', 'password', 'email', 'role']);
        $username = strtolower($_POST['username']);
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $email = $_POST['email'];
        $role = $_POST['role'];

        $existingUser = DataRepo::of(User::class)->select(
            where: [
                'username' => ['=' => $username],
                'OR',
                'email' => ['=' => $email]
            ]
        );

        if (!empty($existingUser)) {
            $this->sendResponse('error', 'Username or Email already exists', null, 409);
            return;
        }

        $user = new User();
        $user->username = $username;
        $user->password = $password;
        $user->email = $email;
        $user->role = $role;

        if (!DataRepo::insert($user)) {
            $this->sendResponse('error', 'Failed to create user', null, 500);
            return;
        }

        $this->sendResponse('success', 'User successfully created');
    }

    public function getUserDetails($userId): void
    {
        try {
            $user = DataRepo::of(User::class)->select(
                where: ['user_id' => ['=' => $userId]]
            );

            if (empty($user)) {
                $this->sendResponse('error', 'User not found', null, 404);
                return;
            }

            $userData = $user[0]->toArray();
            unset($userData['password']);

            $this->sendResponse('success', '', $userData);
        } catch (Exception $e) {
            $this->sendResponse('error', 'An error occurred', null, 500);
        }
    }

    public function updateUser($userId): void
    {
        $this->checkPostArguments(['email', 'role']);
        $email = $_POST['email'];
        $role = $_POST['role'];

        try {
            $user = DataRepo::of(User::class)->select(
                where: ['user_id' => ['=' => $userId]]
            );

            if (empty($user)) {
                $this->sendResponse('error', 'User not found', null, 404);
                return;
            }

            $user[0]->email = $email;
            $user[0]->role = $role;

            if (!DataRepo::update($user[0])) {
                $this->sendResponse('error', 'Failed to update user', null, 500);
                return;
            }

            $this->sendResponse('success', 'User successfully updated');
        } catch (Exception $e) {
            $this->sendResponse('error', 'An error occurred', null, 500);
        }
    }

    public function deleteUser($userId): void
    {
        try {
            $success = DataRepo::of(User::class)->delete(
                where: ['user_id' => ['=' => $userId]]
            );

            if (!$success) {
                $this->sendResponse('error', 'Failed to delete user', null, 500);
                return;
            }

            $this->sendResponse('success', 'User successfully deleted');
        } catch (Exception $e) {
            $this->sendResponse('error', 'An error occurred', null, 500);
        }
    }
}
