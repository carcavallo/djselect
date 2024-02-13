<?php

namespace controller;

use Exception;

use lib\DataRepo\DataRepo;
use model\User;
use trait\getter;

use function util\removeArrayKeys;
use function util\removeArrayValues;

class AuthController extends IOController
{
    use getter;

    public function register(): void
    {
        $arguments = removeArrayValues(User::getDbFields(), ["user_id", "role", "last_login", "created_at"]);
        $this->checkPostArguments($arguments);

        $_POST["username"] = strtolower($_POST["username"]);

        $existingUser = DataRepo::of(User::class)->select(
            where: [
                'username' => ['=' => $_POST["username"]]
            ]
        );

        if (!empty($existingUser)) {
            $this->sendResponse("error", "Username already exists", 409);
            return;
        }

        $user = User::fromArray($_POST);
        if (!DataRepo::insert($user)) {
            $this->sendResponse("error", "An error occurred during registration", 500);
            return;
        }

        $_SESSION = $user->toArray();

        $this->sendResponse("success", "Registration successful");
    }

    public function login(): void
    {
        $this->checkPostArguments(["username", "password"]);

        $_POST["username"] = strtolower($_POST["username"]);

        $user = DataRepo::of(User::class)->select(
            where: [
                "username" => ["=" => $_POST["username"]],
            ]
        );

        if (empty($user) || $user[0]->password != $_POST["password"]) {
            $this->writeLog("Login failed for the user {username} - Login data", 401);
            $this->sendResponse("error", "Username or password incorrect", 401);
        }

        $user[0]->last_login = time();

        DataRepo::update($user[0]);
        
        $_SESSION['user'] = $user[0]->toArray();

        $this->sendResponse("success", "Successfully logged in");
    }
    
    public function logout(bool $respond = true): void
    {
        session_unset();

        if ($respond) {
            $this->sendResponse("success", "Successfully logged out");
        }
    }

    public function checkLogin(): void
    {
        if (empty($_SESSION["user_id"])) {
            $this->logout(false);
            $this->sendResponse("error", "You are not logged in", 403);
        }
    }
}