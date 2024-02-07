<?php

namespace controller;

use lib\DataRepo\DataRepo;
use model\Review;

class ReviewController extends IOController
{
    public function addReview(): void
    {
        $this->checkPostArguments(["dj_id", "event_id", "author_id", "rating", "comment"]);
        $review = new Review();
        foreach ($_POST as $key => $value) {
            if (property_exists($review, $key)) {
                $review->$key = $value;
            }
        }

        if (!DataRepo::insert($review)) {
            $this->sendResponse("error", "Bewertung konnte nicht hinzugefügt werden", null, 500);
            return;
        }

        $this->sendResponse("success", "Bewertung erfolgreich hinzugefügt");
    }
}
