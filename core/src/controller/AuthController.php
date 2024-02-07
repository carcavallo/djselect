<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\User;

class AuthController extends IOController
{
    public function login(): void
    {
        $this->checkPostArguments(["username", "password"]);
        $_POST["username"] = strtolower($_POST["username"]);

        $user = DataRepo::of(User::class)->select(
            where: ["username" => ["=" => $_POST["username"]]]
        );

        if (empty($user) || !password_verify($_POST["password"], $user[0]->password)) {
            $this->writeLog("Login attempt failed for user {username}", ["username" => $_POST["username"]], 401);
            $this->sendResponse("error", "Invalid username or password", null, 401);
            return;
        }

        $userData = $user[0]->toArray();
        unset($userData['password']);

        $_SESSION['user'] = $userData;
        $this->sendResponse("success", "Login successful");
    }

    public function register(): void
    {
        $requiredFields = ["username", "password", "email", "role"];
        $this->checkPostArguments($requiredFields);

        $_POST["username"] = strtolower($_POST["username"]);
        $_POST["password"] = password_hash($_POST["password"], PASSWORD_DEFAULT);

        $existingUser = DataRepo::of(User::class)->select(
            where: ["username" => ["=" => $_POST["username"]]]
        );

        if (!empty($existingUser)) {
            $this->writeLog("Registration failed for user {username}: Username already taken", ["username" => $_POST["username"]], 409);
            $this->sendResponse("error", "Username already taken", null, 409);
            return;
        }

        $user = new User();
        foreach ($requiredFields as $field) {
            if (property_exists($user, $field)) {
                $user->$field = $_POST[$field];
            }
        }

        if (!DataRepo::insert($user)) {
            $this->writeLog("Error registering user {username}", ["username" => $_POST["username"]], 500);
            $this->sendResponse("error", "An error occurred during registration", null, 500);
            return;
        }

        $userData = $user->toArray();
        unset($userData['password']);

        $_SESSION['user'] = $userData;
        $this->sendResponse("success", "Registration successful");
    }

    public function logout(): void
    {
        session_unset();
        session_destroy();
        $this->sendResponse("success", "Logged out successfully");
    }
}
