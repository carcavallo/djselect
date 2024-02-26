<?php

namespace model;

use JsonSerializable;
use lib\DataRepo\trait\model;
use lib\DataRepo\feature\db_column;

class User implements JsonSerializable {
    use model;

    public const TABLE_NAME = "users";
    public const PRIMARY_KEY = "user_id";

    #[db_column]
    public ?string $user_id;
    #[db_column]
    public string $username;
    #[db_column]
    public string $password;
    #[db_column]
    public string $email;
    #[db_column]
    public string $role;
    #[db_column]
    public ?string $reset_token = null;
    #[db_column]
    public ?string $reset_token_expires = null;
    #[db_column]
    public ?int $last_login = null;
    #[db_column]
    public string $created_at;
}
