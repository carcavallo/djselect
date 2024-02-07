<?php

namespace controller;

use lib\DataRepo\DataRepo;
use model\Event;

class EventController extends IOController
{
    public function createEvent(): void
    {
        $this->checkPostArguments(["name", "description", "location", "start_date", "end_date", "created_by"]);
        $event = new Event();
        foreach ($_POST as $key => $value) {
            if (property_exists($event, $key)) {
                $event->$key = $value;
            }
        }

        if (!DataRepo::insert($event)) {
            $this->sendResponse("error", "Event konnte nicht erstellt werden", null, 500);
            return;
        }

        $this->sendResponse("success", "Event erfolgreich erstellt");
    }
}