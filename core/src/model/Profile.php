<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;
use lib\DataRepo\feature\db_foreign_key;
use lib\DataRepo\feature\to_join;

class Profile implements JsonSerializable {
    use model;

    public const TABLE_NAME = "profiles";
    public const PRIMARY_KEY = "profile_id";

    #[db_column]
    public ?string $profile_id;
    #[db_column, db_foreign_key(User::class), to_join("user")]
    public ?string $user_id;
    #[db_column]
    public ?string $bio;
    #[db_column]
    public ?string $profile_picture;
    #[db_column]
    public ?string $contact_info;
    #[db_column]
    public string $created_at;
    #[db_column]
    public string $updated_at;
}
