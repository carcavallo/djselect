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
     * @param string $bookingId The booking ID to search for.
     * @return void
     * @throws Exception
     */
    public function getBooking(string $bookingId): void
    {
        $booking = DataRepo::of(Booking::class)->select(
            where: [
                "booking_id" => ["=" => $bookingId],
            ]
        );

        if (!empty($booking)) {
            $this->sendResponse("success", "Booking retrieved successfully", $booking[0]->toArray());
        } else {
            $this->sendResponse("error", "Booking not found", null, 404);
        }
    }

    /**
     * Updates a booking with the specified details.
     * Validates the booking ID and the fields to be updated.
     * @param string $bookingId The booking ID to update.
     * @param array $updateFields The fields to update in the booking.
     * @return void
     * @throws Exception
     */
    public function updateBooking(string $bookingId): void
    {
        $booking = DataRepo::of(Booking::class)->select(
            where: ["booking_id" => ["=" => $bookingId]]
        );
    
        if (empty($booking)) {
            $this->sendResponse("error", "Booking not found", null, 404);
            return;
        }
    
        $updateFields = $_POST;
        unset($updateFields['booking_id'], $updateFields['created_at'], $updateFields['updated_at']);
    
        if (DataRepo::update($booking[0], $updateFields)) {
            $this->sendResponse("success", "Booking updated successfully");
        } else {
            $this->sendResponse("error", "Failed to update booking", null, 500);
        }
    }
    

    /**
     * Deletes a booking based on the provided booking ID.
     * @param string $bookingId The booking ID to delete.
     * @return void
     * @throws Exception
     */
    public function deleteBooking(string $bookingId): void
    {
        $booking = DataRepo::of(Booking::class)->select(
            where: [
                "booking_id" => ["=" => $bookingId],
            ]
        );

        if (empty($booking)) {
            $this->sendResponse("error", "Booking not found", null, 404);
            return;
        }

        if (DataRepo::delete($booking[0])) {
            $this->sendResponse("success", "Booking deleted successfully");
        } else {
            $this->sendResponse("error", "Failed to delete booking", null, 500);
        }
    }
}
