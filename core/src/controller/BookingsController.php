<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use trait\getter;
use util\SendGridMailer;
use model\Booking;
use model\Event;

class BookingsController extends IOController
{
    use getter;

    private $mailer;

    public function __construct() {
        $this->mailer = new SendGridMailer($_ENV['SENDGRID_API_KEY']);
    }

    /**
     * Creates a new booking with the provided details.
     * Validates the necessary input fields before creating the booking.
     * @return void
     * @throws Exception
     */
    public function createBooking(): void {
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

            if (!empty($event) && isset($event[0])) {
                $organizerId = $event[0]->organizer_id;
                $organizer = $this->_getUser($organizerId);
                if ($organizer) {
                    $subject = "New Booking Request";
                    $content = "A new booking request has been made for your event '{$event[0]->name}'. Booking ID: {$booking->booking_id}. Please log in to your dashboard to view the details.";
                    $this->mailer->sendEmailNotification($organizer->email, $subject, $content);
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
    public function updateBooking(string $bookingId): void {
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
                    $subject = $otherBooking->booking_id === $bookingId ? 
                               "Booking Confirmation" : 
                               "Booking Cancellation";
                    $content = $otherBooking->booking_id === $bookingId ? 
                               "Your booking for the event with ID: {$booking->event_id} has been confirmed. Please check your dashboard for more details." : 
                               "We regret to inform you that your booking for the event with ID: {$booking->event_id} has been cancelled. Please check your dashboard for more details.";
                    $this->mailer->sendEmailNotification($dj->email, $subject, $content);
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
                    $subject = "Booking Withdrawal Notification";
                    $content = "The booking request with ID: {$bookingId} for your event '{$event[0]->name}' has been withdrawn. Please log in to your dashboard to view the details.";
                    $this->mailer->sendEmailNotification($organizer->email, $subject, $content);
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
}