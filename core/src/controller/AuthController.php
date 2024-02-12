<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\User;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class AuthController extends IOController
{
    public function register(): void
    {
        $arguments = removeArrayValues(User::getDbFields(), ["user_id", "role", "created_at"]);
        $this->checkPostArguments($arguments);

        $_POST["username"] = strtolower($_POST["username"]);

        $existingUser = DataRepo::of(User::class)->select(
            where: [
                'username' => ['=' => $_POST["username"]]
            ]
        );

        if (!empty($existingUser)) {
            $this->sendResponse("error", "Username already exists", null, 409);
            return;
        }

        $user = User::fromArray($_POST);
        if (!DataRepo::insert($user)) {
            $this->sendResponse("error", "An error occurred during registration", null, 500);
            return;
        }

        $this->sendResponse("success", "Registration successful");
    }
}