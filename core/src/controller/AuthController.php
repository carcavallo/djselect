<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use trait\getter;
use model\User;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class AuthController extends IOController
{
    use getter;

    /**
     * Checks the user's credentials to start a session.
     * If the credentials are valid, a session is started and a success message is returned.
     * If the credentials are invalid, an error message is returned.
     * @return void
     * @throws Exception See DataRepo
     */
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
            $this->writeLog("Login failed for the user {username} - Login data", ["username" => $_POST["username"]], 401);
            $this->sendResponse("error", "Username or password incorrect", null, 401);
        }

        $user[0]->last_login = time();

        DataRepo::update($user[0]);
        
        $_SESSION['user'] = $user[0]->toArray();

        $this->sendResponse("success", "Successfully logged in");
    }

    /**
     * Registers a new user and starts a session.
     * If the user name or e-mail address already exists in the database or is invalid, an error message is returned.
     * If the registration is successful, a session is started and a success message is returned.
     * @return void
     * @throws Exception See DataRepo
     */
    public function register(): void
    {
        $arguments = removeArrayValues(User::getDbFields(), ["user_id", "role", "last_login", "created_at"]);
        $this->checkPostArguments($arguments);
    
        $_POST["username"] = strtolower($_POST["username"]);
        $_POST["email"] = strtolower($_POST["email"]);
    
        $existingUsername = DataRepo::of(User::class)->select(
            where: [
                'username' => ['=' => $_POST["username"]]
            ]
        );
    
        if (!empty($existingUsername)) {
            $this->sendResponse("error", "Username already exists", null, 409);
            return;
        }
    
        $existingEmail = DataRepo::of(User::class)->select(
            where: [
                'email' => ['=' => $_POST["email"]]
            ]
        );
    
        if (!empty($existingEmail)) {
            $this->sendResponse("error", "Email already registered", null, 409);
            return;
        }
    
        $user = User::fromArray($_POST);
        if (!DataRepo::insert($user)) {
            $this->sendResponse("error", "An error occurred during registration", null, 500);
            return;
        }
    
        $_SESSION = $user->toArray();
    
        $this->sendResponse("success", "Registration successful", removeArrayKeys($_SESSION, ["user_id", "password"]));
    }    
    
    /**
     * Ends the current session and returns a success message if $respond is set to true.
     * @param bool $respond Specifies whether a success message should be returned.
     * @return void
     */
    public function logout(bool $respond = true): void
    {
        session_unset();

        if ($respond) {
            $this->sendResponse("success", "Successfully logged out");
        }
    }

    /**
     * Checks whether the user is logged in and returns an error message if the user is not logged in.
     * If the user is not logged in correctly, the user is logged out correctly and completely.
     * @return void
     */
    public function checkLogin(): void
    {
        if (empty($_SESSION["user_id"])) {
            $this->logout(false);
            $this->sendResponse("error", "You are not logged in", 403);
        }
    }
}