<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use trait\getter;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use model\Booking;
use model\Event;

class BookingsController extends IOController
{
    use getter;

    /**
     * Creates a new booking with the provided details.
     * Validates the necessary input fields before creating the booking.
     * @return void
     * @throws Exception
     */
    public function createBooking(): void
    {
        $this->checkPostArguments(["event_id", "dj_id", "status"]);
    
        $booking = Booking::fromArray([
            "event_id" => $_POST["event_id"],
            "dj_id" => $_POST["dj_id"],
            "status" => $_POST["status"],
        ]);
    
        if (DataRepo::insert($booking)) {
            $event = DataRepo::of(Event::class)->select(
                where: ["event_id" => ["=" => $_POST["event_id"]]]
            );
    
            if (!empty($event)) {
                $organizerId = $event[0]->organizer_id;
                $organizer = $this->_getUser($organizerId);
                if ($organizer) {
                    $this->sendEmailNotification($organizer->email, $event[0]->name, $booking->booking_id);
                }
            }
    
            $this->sendResponse("success", "Booking created successfully", ["booking_id" => $booking->booking_id]);
        } else {
            $this->sendResponse("error", "Failed to create booking", null, 500);
        }
    }

    /**
     * Retrieves a booking based on the booking ID provided.
     * Utilizes the _getBooking method from the getter trait to fetch booking details.
     * @param string $bookingId The booking ID to search for.
     * @return void
     * @throws Exception
     */
    public function getBookings(string $userId): void
    {
        $bookings = DataRepo::of(Booking::class)->select(
            where: ["dj_id" => ["=" => $userId]]
        );

        if (empty($bookings)) {
            $this->sendResponse("error", "No bookings for this user found", null, 404);
        }

        $this->sendResponse("success", "Bookings retrieved successfully", $bookings);
    }

    /**
     * Retrieves bookings based on the Event ID provided.
     * @param string $eventId The event ID to search with.
     * @return void
     * @throws Exception
     */
    public function getBookingByEventId(string $eventId): void
    {
        $event = DataRepo::of(Booking::class)->select(
            where: ["event_id" => ["=" => $eventId]]
        );

        if (empty($event)) {
            $this->sendResponse("error", "No booking for this event found", null, 404);
        }

        $this->sendResponse("success", "Booking for event retrieved successfully", $event);
    }

    /**
     * Updates a booking with the specified details.
     * Allows withdrawal of a booking request if it has not been confirmed.
     * Sends an email to the event organizer about the booking update or withdrawal.
     * @param string $bookingId The booking ID to update.
     * @return void
     * @throws Exception
     */
    public function updateBooking(string $bookingId): void
    {
        $booking = $this->_getBooking($bookingId);
    
        if (!$booking) {
            $this->sendResponse("error", "Booking not found", null, 404);
            return;
        }
    
        $isConfirming = isset($_POST['status']) && $_POST['status'] === 'confirmed';
        $isWithdrawing = isset($_POST['status']) && $_POST['status'] === 'cancelled';
    
        if ($isConfirming) {
            $allBookingsForEvent = DataRepo::of(Booking::class)->select(
                where: ["event_id" => ["=" => $booking->event_id]]
            );
    
            foreach ($allBookingsForEvent as $otherBooking) {
                if ($otherBooking->booking_id === $bookingId) {
                    $otherBooking->status = 'confirmed';
                } else {
                    $otherBooking->status = 'cancelled';
                }
                DataRepo::update($otherBooking);
    
                $dj = $this->_getUser($otherBooking->dj_id);
                if ($dj) {
                    if ($otherBooking->booking_id === $bookingId) {
                        $this->sendConfirmationEmailNotification($dj->email, $booking->event_id);
                    } else {
                        $this->sendCancellationEmailNotification($dj->email, $booking->event_id);
                    }
                }
            }
            $this->sendResponse("success", "Booking confirmed and others cancelled", null, 200);
            return;
        } 
    
        if ($isWithdrawing && $booking->status !== "confirmed") {
            $booking->status = 'cancelled';
            DataRepo::update($booking);
    
            $event = DataRepo::of(Event::class)->select(
                where: ["event_id" => ["=" => $booking->event_id]]
            );
    
            if (!empty($event)) {
                $organizerId = $event[0]->organizer_id;
                $organizer = $this->_getUser($organizerId);
                if ($organizer) {
                    $this->sendWithdrawalEmailNotification($organizer->email, $event[0]->name, $bookingId);
                }
            }
            $this->sendResponse("success", "Booking withdrawn successfully", null, 200);
            return;
        }
    
        $this->sendResponse("error", "Invalid booking status update", null, 400);
    }
    
    /**
     * Deletes a booking based on the provided booking ID.
     * Verifies the booking's existence before proceeding with deletion.
     * @param string $bookingId The booking ID to delete.
     * @return void
     * @throws Exception
     */
    public function deleteBooking(string $bookingId): void
    {
        $booking = $this->_getBooking($bookingId);

        if (DataRepo::delete($booking)) {
            $this->sendResponse("success", "Booking deleted successfully");
        } else {
            $this->sendResponse("error", "Failed to delete booking", null, 500);
        }
    }

    protected function sendEmailNotification(string $email, string $eventName, string $bookingId)
    {
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
            $mail->Subject = 'New Booking Request';
            $mail->Body    = "A new booking request has been made for your event '{$eventName}'. Booking ID: {$bookingId}. Please log in to your dashboard to view the details.";

            $mail->send();
        } catch (PHPMailerException $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }
    }

    protected function sendWithdrawalEmailNotification(string $email, string $eventName, string $bookingId)
    {
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
            $mail->Subject = 'Booking Withdrawal Notification';
            $mail->Body = "The booking request with ID: {$bookingId} for your event '{$eventName}' has been withdrawn. Please log in to your dashboard to view the details.";
    
            $mail->send();
        } catch (PHPMailerException $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }
    }

    protected function sendConfirmationEmailNotification(string $email, string $eventId) {
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
            $mail->Subject = 'Booking Confirmation Notification';
            $mail->Body = "Your booking request for the event with ID: {$eventId} has been confirmed. Please check your dashboard for more details.";
    
            $mail->send();
        } catch (PHPMailerException $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }
    }
    
    protected function sendCancellationEmailNotification(string $email, string $eventId) {
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
            $mail->Subject = 'Booking Cancellation Notification';
            $mail->Body = "We regret to inform you that your booking request for the event with ID: {$eventId} has been cancelled. For more information, please check your dashboard.";
    
            $mail->send();
        } catch (PHPMailerException $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }
    }
    
}
