<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\User;
use PHPMailer\PHPMailer\PHPMailer;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class AuthController extends IOController
{
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

        if (empty($user) || !password_verify($_POST["password"], $user[0]->password)) {
            $this->writeLog("Login failed for the user {username} - Login data", ["username" => $_POST["username"]], 401);
            $this->sendResponse("error", "Username or password incorrect", null, 401);
        } else {
            $user[0]->last_login = time();

            DataRepo::update($user[0]);
    
            $_SESSION['user'] = $user[0]->toArray();
            unset($_SESSION['password']);
    
            $this->sendResponse("success", "Successfully logged in");
        }
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
    
        $_POST["password"] = password_hash($_POST["password"], PASSWORD_DEFAULT);

        $user = User::fromArray($_POST);
        if (!DataRepo::insert($user)) {
            $this->sendResponse("error", "An error occurred during registration", null, 500);
            return;
        }
    
        $_SESSION = $user->toArray();
        unset($_SESSION['password']);

        $this->sendResponse("success", "Registration successful", removeArrayKeys($_SESSION, ["password"]));
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

    public function requestPasswordReset(): void
    {
        $this->checkPostArguments(["email"]);
        $email = strtolower($_POST["email"]);
    
        $user = DataRepo::of(User::class)->select(
            where: ["email" => ["=" => $email]]
        );
    
        if (!empty($user)) {
            $user = $user[0];
            $token = bin2hex(random_bytes(16));
            $expires = new \DateTime('now +1 hour');
    
            $user->reset_token = $token;
            $user->reset_token_expires = $expires->format('Y-m-d H:i:s');
            DataRepo::update($user);
    
            $mail = new PHPMailer(true);

            try {
                $mail->SMTPDebug = 0;
                $mail->isSMTP();
                $mail->Host = $_ENV['EMAIL_HOST'];
                $mail->SMTPAuth = true;
                $mail->Username = $_ENV['EMAIL_USERNAME'];
                $mail->Password = $_ENV['EMAIL_PASSWORD'];
                $mail->SMTPSecure = 'tls';
                $mail->Port = 587;
                $mail->CharSet = 'UTF-8';
    
                $mail->setFrom('djselect@alessio.fm', 'DJSELECT');
                $mail->addAddress($email);
    
                $mail->isHTML(true);
                $mail->Subject = 'Password Reset Request';
                $mail->Body    = 'Please click on the following link to reset your password: <a href="http://localhost/reset_password.php?token=' . $token . '">Reset Password</a>';
    
                $mail->send();
                $this->sendResponse("success", "If the email is registered, you will receive a password reset link.");
            } catch (Exception $e) {
                $this->sendResponse("error", "Mailer Error: " . $mail->ErrorInfo, null, 500);
            }
        } else {
            $this->sendResponse("success", "If the email is registered, you will receive a password reset link.");
        }
    }
}