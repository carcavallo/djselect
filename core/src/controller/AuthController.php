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
        $arguments = removeArrayValues(User::getDbFields(), ["user_id", "role", "last_login", "created_at", "reset_token", "reset_token_expires"]);
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
    
        $this->sendResponse("success", "Registration successful");
    }

    /**
     * Retrieves session data for the current logged-in user.
     * @return array|null The session data for the current user or null if not logged in.
     */
    public function getSession()
    {
        if (isset($_SESSION['user']['user_id']) && $_SESSION['expires'] > time()) {
            $this->sendResponse("success", "User Session retrieved successfully", removeArrayKeys($_SESSION, ['password']));
        } else {
            $this->sendResponse("error", "Session expired or not logged in", null, 401);
        }
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
        if (empty($_SESSION['user']['user_id'])) {
            $this->logout(false);
            $this->sendResponse("error", "You are not logged in", 403);
        }
    }

    /**
     * Initiates the process for a user to reset their password. It checks for the user's email in the database.
     * If the email exists, it generates a reset token and sends a password reset link to the user's email.
     * The reset token is valid for one hour. It sends a success message indicating that if the email is registered,
     * a reset link will be sent. This message is sent regardless of whether the email is in the database to prevent
     * information disclosure about registered emails.
     * @return void
     * @throws Exception If there's an issue sending the email through PHPMailer.
     */
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
    
                $mail->setFrom('alessiopirovino@gmail.com', 'DJSELECT');
                $mail->addAddress($email);
    
                $mail->isHTML(true);
                $mail->Subject = 'Password Reset Request';
                $mail->Body = 'Please click on the following link to reset your password: <a href="http://localhost:3000/reset?token=' . $token . '">Reset Password</a>';
    
                $mail->send();
                $this->sendResponse("success", "If the email is registered, you will receive a password reset link.");
            } catch (Exception $e) {
                $this->sendResponse("error", "Mailer Error: " . $mail->ErrorInfo, null, 500);
            }
        } else {
            $this->sendResponse("success", "If the email is registered, you will receive a password reset link.");
        }
    }
    
    /**
     * Confirms the password reset request by checking the provided reset token. It updates the user's password
     * if the token is valid and has not expired. It sends a success message upon successful password reset or
     * an error message if the token is invalid or has expired.
     * @return void
     * @throws Exception If there's an error updating the user's password in the database.
     */
    public function confirmResetPassword(): void
    {
        $this->checkPostArguments(["token", "password"]);

        $token = $_POST["token"];
        $newPassword = $_POST["password"];

        $user = DataRepo::of(User::class)->select(
            where: ["reset_token" => ["=" => $token]]
        );

        if (empty($user) || new DateTime() > new DateTime($user[0]->reset_token_expires)) {
            $this->sendResponse("error", "Reset token is invalid or has expired", null, 400);
            return;
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $user[0]->password = $hashedPassword;
        $user[0]->reset_token = null;
        $user[0]->reset_token_expires = null;

        if (DataRepo::update($user[0])) {
            $this->sendResponse("success", "Password has been reset successfully.");
        } else {
            $this->sendResponse("error", "Failed to reset password", null, 500);
        }
    }
}