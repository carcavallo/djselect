<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\Booking;

class BookingController extends IOController
{
    public function fetchBookingsForEvent($eventId): void
    {
        $bookings = DataRepo::of(Booking::class)->select(
            where: [
                "event_id" => ["=" => $eventId]
            ]
        );

        if (empty($bookings)) {
            $this->sendResponse("error", "Keine Buchungen gefunden", null);
            return;
        }

        $this->sendResponse("success", "", ["bookings" => $bookings]);
    }
}