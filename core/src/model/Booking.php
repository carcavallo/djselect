<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;
use lib\DataRepo\feature\db_foreign_key;
use lib\DataRepo\feature\to_join;

class Booking implements JsonSerializable {
    use model;

    public const TABLE_NAME = "bookings";
    public const PRIMARY_KEY = "booking_id";

    #[db_column]
    public ?string $booking_id;
    #[db_column, db_foreign_key(Event::class), to_join("event")]
    public ?string $event_id;
    #[db_column, db_foreign_key(User::class), to_join("dj")]
    public ?string $dj_id;
    #[db_column]
    public string $status;
    #[db_column]
    public string $created_at;
    #[db_column]
    public string $updated_at;
}
