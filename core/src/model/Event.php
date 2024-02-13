<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class Event implements JsonSerializable {
    use model;

    public const TABLE_NAME = 'events';
    public const PRIMARY_KEY = 'event_id';

    #[db_column]
    public ?string $event_id;
    #[db_column]
    public string $name;
    #[db_column]
    public string $location;
    #[db_column]
    public string $date;
    #[db_column]
    public string $time;
    #[db_column]
    public string $organizer_id;
    #[db_column]
    public string $created_at;
}
