<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class UserProfile implements JsonSerializable {
    use model;

    public const TABLE_NAME = 'user_profiles';
    public const PRIMARY_KEY = 'profile_id';

    #[db_column]
    public ?string $profile_id;
    #[db_column]
    public string $user_id;
    #[db_column]
    public string $bio;
    #[db_column]
    public string $profile_picture;
    #[db_column]
    public string $contact_info;
    #[db_column]
    public string $created_at;
    #[db_column]
    public string $updated_at;
}
