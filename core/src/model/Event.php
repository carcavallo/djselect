<?php

namespace model;

use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class Event {
    use model;

    public const TABLE_NAME = 'events';
    public const PRIMARY_KEY = 'event_id';

    #[db_column]
    public ?int $event_id = null;
    #[db_column]
    public string $name;
    #[db_column]
    public ?string $description = null;
    #[db_column]
    public ?string $location = null;
    #[db_column]
    public ?string $start_date = null;
    #[db_column]
    public ?string $end_date = null;
    #[db_column]
    public int $created_by;
}
