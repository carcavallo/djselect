<?php

namespace trait;

use lib\DataRepo\DataRepo;
use model\User;
use model\Event;
use model\Booking;
use controller\AuthController;

trait getter
{
    /**
     * Retrieves the user with the specified ID.
     * @param string $id The ID of the user.
     * @return object The user object with the specified ID.
     */
    protected function _getUser(string $id): object
    {
        $user = DataRepo::of(User::class)->select(
            where: ["user_id" => ["=" => $id]]
        );

        if (empty($user)) {
            if (isset($_SESSION["user_id"]) && $id === $_SESSION["user_id"]) {
                (new AuthController())->logout(false);
                $this->sendResponse("error", "This account is invalid", null, 403);
            }
            $this->sendResponse("error", "User ID {$id} not known", null, 400, ["id" => $id]);
        }

        return $user[0];
    }

    /**
     * Retrieves an event based on the provided event ID.
     * @param string $id The unique identifier of the event to retrieve.
     * @return object The event object with the specified ID.
     */
    protected function _getEvent(string $id): object
    {
        $event = DataRepo::of(Event::class)->select(
            where: ["event_id" => ["=" => $id]]
        );

        if (empty($event)) {
            $this->sendResponse("error", "Event not found", null, 404);
        }


        return $event[0];
    }

    /**
     * Retrieves a booking based on the booking ID provided.
     * @param string $id The booking ID to search for.
     * @return object The booking object.
     */
    protected function _getBooking(string $id): object
    {
        $booking = DataRepo::of(Booking::class)->select(
            where: ["booking_id" => ["=" => $id]]
        );

        if (empty($booking)) {
            $this->sendResponse("error", "Booking not found", null, 404);
        }

        return $booking[0];
    }
}
