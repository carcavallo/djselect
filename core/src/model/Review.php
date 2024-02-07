<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class Review implements JsonSerializable {
    use model;

    public const TABLE_NAME = 'reviews';
    public const PRIMARY_KEY = 'review_id';

    #[db_column]
    public ?int $review_id = null;
    #[db_column]
    public int $dj_id;
    #[db_column]
    public int $event_id;
    #[db_column]
    public int $author_id;
    #[db_column]
    public int $rating;
    #[db_column]
    public ?string $comment = null;
    #[db_column]
    public string $created_at;
}
