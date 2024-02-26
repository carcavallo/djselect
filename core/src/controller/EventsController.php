<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use model\Event;
use trait\getter;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class EventsController extends IOController
{
    use getter;
    
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
     * Retrieves an event based on the provided event ID.
     * @param string $eventId The unique identifier of the event to retrieve.
     * @return void
     */
    public function getEvent(string $eventId): void
    {
        $event = $this->_getEvent($eventId);
        $this->sendResponse("success", "Event retrieved successfully", $event->toArray());
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
     * Checks if the event exists before attempting deletion. If the event is found, it is deleted, and a success response is returned.
     * If the event does not exist, an error message is returned.
     * @param string $eventId The unique identifier of the event to be deleted.
     * @return void
     * @throws Exception If there's an error during the database operation or if the event does not exist.
     */
    public function deleteEvent(string $eventId): void
    {
        $event = $this->_getEvent($eventId);

        if (DataRepo::delete($event)) {
            $this->sendResponse("success", "Event deleted successfully");
        } else {
            $this->sendResponse("error", "Failed to delete event", null, 500);
        }
    }
}
