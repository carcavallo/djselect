<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use trait\getter;
use model\Booking;

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
    public function getBooking(string $bookingId): void
    {
        $booking = $this->_getBooking($bookingId);
        $this->sendResponse("success", "Booking retrieved successfully", $booking->toArray());
    }

    /**
     * Updates a booking with the specified details.
     * Validates the booking ID and the fields to be updated.
     * @param string $bookingId The booking ID to update.
     * @return void
     * @throws Exception
     */
    public function updateBooking(string $bookingId): void
    {
        $booking = $this->_getBooking($bookingId);

        foreach ($_POST as $key => $value) {
            if (property_exists($booking, $key) && !in_array($key, ['booking_id', 'created_at', 'updated_at'])) {
                $booking->$key = $value;
            }
        }
    
        if (!DataRepo::update($booking)) {
            $this->sendResponse("error", "Failed to update booking", null, 500);
        } else {
            $this->sendResponse("success", "Booking updated successfully");
        }
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
