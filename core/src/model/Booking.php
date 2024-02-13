<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class Booking implements JsonSerializable {
    use model;

    public const TABLE_NAME = 'bookings';
    public const PRIMARY_KEY = 'booking_id';

    #[db_column]
    public ?string $booking_id;
    #[db_column]
    public string $event_id;
    #[db_column]
    public string $user_id;
    #[db_column]
    public string $status;
    #[db_column]
    public string $created_at;
    #[db_column]
    public string $updated_at;
}
