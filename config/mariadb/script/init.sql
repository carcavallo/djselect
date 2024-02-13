CREATE DATABASE IF NOT EXISTS djselect DEFAULT CHARACTER SET UTF8 DEFAULT COLLATE utf8_bin;
USE djselect;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT UUID(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('event_manager', 'dj') NOT NULL,
    last_login INTEGER DEFAULT NUll,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;