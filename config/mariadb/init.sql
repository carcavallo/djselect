CREATE DATABASE IF NOT EXISTS djselect DEFAULT CHARACTER SET UTF8 DEFAULT COLLATE utf8_bin;
USE djselect;

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('administrator', 'event_manager', 'dj') NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    last_login INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT (UUID()),
    organizer_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id)
) ENGINE=InnoDB;


CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT (UUID()),
    event_id UUID NOT NULL,
    dj_id UUID NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (dj_id) REFERENCES users(user_id)
) ENGINE=InnoDB;