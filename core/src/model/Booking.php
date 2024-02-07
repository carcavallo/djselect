<?php

namespace model;

use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class Booking {
    use model;

    public const TABLE_NAME = 'bookings';
    public const PRIMARY_KEY = 'booking_id';

    #[db_column]
    public ?int $booking_id = null;
    #[db_column]
    public int $event_id;
    #[db_column]
    public int $dj_id;
    #[db_column]
    public string $booking_status;
    #[db_column]
    public string $booked_at;
}
