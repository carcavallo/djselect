<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\Event;
use model\Booking;
use trait\getter;
use util\SendGridMailer;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class EventsController extends IOController
{
    use getter;
    
    private $mailer;

    public function __construct()
    {
        $this->mailer = new SendGridMailer($_ENV['SENDGRID_API_KEY']);
    }

    /**
     * Creates a new event with the provided details.
     * Validates the necessary input fields before creating the event.
     * @return void
     * @throws Exception If there's an error during the database operation.
     */
    public function createEvent(): void
    {
        $requiredFields = removeArrayValues(Event::getDbFields(), ['event_id', 'created_at', 'updated_at']);
        $this->checkPostArguments($requiredFields);

        $event = Event::fromArray($_POST);

        if (!DataRepo::insert($event)) {
            $this->sendResponse("error", "Failed to create event", null, 500);
            return;
        }

        $this->sendResponse("success", "Event created successfully", removeArrayKeys($event->toArray(), ['organizer_id']));
    }

    /**
     * Retrieve a event by its id.
     * @param string $eventId The unique identifier of the event to retrieve.
     * @return void
     */
    public function getEvent(string $eventId): void
    {
        $event = DataRepo::of(Event::class)->select(
            where: ["event_id" => ["=" => $eventId]]
        );

        if (empty($event)) {
            $this->sendResponse("error", "No event found", null, 404);
        } else {
            $this->sendResponse("success", "Event retrieved successfully", $event);
        }    
    }    

    /**
     * Retrieves all events.
     * @return void
     */
    public function getEvents(): void
    {
        $events = DataRepo::of(Event::class)->select(orderBy: ['start_datetime' => 'ASC']);

        if (empty($events)) {
            $this->sendResponse("error", "No events found", null, 404);
        } else {
            $this->sendResponse("success", "Events retrieved successfully", $events);
        }    
    }

    /**
     * Retrieves created events based on the provided user ID.
     * @param string $userId The unique identifier of the user.
     * @return void
     */
    public function getUserEvents(string $userId): void
    {
        $events = DataRepo::of(Event::class)->select(
            where: ["organizer_id" => ["=" => $userId]],
            orderBy: ['start_datetime' => 'ASC']
        );

        $this->sendResponse("success", "Events retrieved successfully", $events);
    }

    /**
     * Updates an existing event with the specified details provided in the request body.
     * Validates the event ID and ensures the event exists before attempting to update.
     * Unsets non-updatable fields to prevent accidental modification.
     * @param string $eventId The unique identifier of the event to be updated.
     * @return void
     * @throws Exception If there's an error during the database operation or if the event does not exist.
     */
    public function updateEvent(string $eventId): void
    {
        $event = $this->_getEvent($eventId);
    
        foreach ($_POST as $key => $value) {
            if (property_exists($event, $key) && !in_array($key, ['event_id', 'created_at', 'updated_at'])) {
                $event->$key = $value;
            }
        }
    
        if (!DataRepo::update($event)) {
            $this->sendResponse("error", "Failed to update event", null, 500);
        } else {
            $this->sendResponse("success", "Event updated successfully");
        }
    }

    /**
     * Deletes an event based on the provided event ID.
     * Notifies DJs via email if the event has confirmed bookings before deletion.
     */
    public function deleteEvent(string $eventId): void {
        $event = $this->_getEvent($eventId);
    
        if (!$event) {
            $this->sendResponse("error", "No event found", null, 404);
            return;
        }
    
        $confirmedBookings = DataRepo::of(Booking::class)->select(
            where: ["event_id" => ["=" => $eventId], "status" => ["=" => "confirmed"]]
        );
    
        foreach ($confirmedBookings as $booking) {
            $dj = $this->_getUser($booking->dj_id);
            if ($dj) {
                $subject = 'Event Cancellation Notification';
                $content = "Dear DJ, the event '{$event->name}' you were booked for has been cancelled. We apologize for any inconvenience.";
                $this->mailer->sendEmailNotification($dj->email, $subject, $content);
            }
        }
    
        $deleteBookingsResult = DataRepo::of(Booking::class)->delete(
            where: ["event_id" => ["=" => $eventId]]
        );
    
        if (!$deleteBookingsResult) {
            $this->sendResponse("error", "Failed to delete associated bookings", null, 500);
            return;
        }
    
        if (DataRepo::delete($event)) {
            $this->sendResponse("success", "Event deleted successfully and emails sent to confirmed DJs");
        } else {
            $this->sendResponse("error", "Failed to delete event", null, 500);
        }
    }
}
