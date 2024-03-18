<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;
use lib\DataRepo\feature\db_foreign_key;
use lib\DataRepo\feature\to_join;

class Event implements JsonSerializable {
    use model;

    public const TABLE_NAME = "events";
    public const PRIMARY_KEY = "event_id";

    #[db_column]
    public ?string $event_id;
    #[db_column, db_foreign_key(User::class), to_join("organizer")]
    public ?string $organizer_id;
    #[db_column]
    public string $name;
    #[db_column]
    public string $location;
    #[db_column]
    public string $start_datetime;
    #[db_column]
    public string $end_datetime;
    #[db_column]
    public ?string $description;
    #[db_column]
    public string $created_at;
    #[db_column]
    public string $updated_at;
}
