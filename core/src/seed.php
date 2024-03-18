<?php
$adminHashedPassword = password_hash('admin', PASSWORD_DEFAULT);
$djHashedPassword = password_hash('dj', PASSWORD_DEFAULT);
$managerHashedPassword = password_hash('manager', PASSWORD_DEFAULT);

$pdo = new PDO('mysql:host=127.0.0.1;dbname=djselect', 'synopsis', 'toor');

$sql = "INSERT INTO users (username, password, email, role) VALUES (:username, :password, :email, :role)";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':username' => 'admin',
    ':password' => $adminHashedPassword,
    ':email' => 'admin@alessio.fm',
    ':role' => 'administrator'
]);

$stmt->execute([
    ':username' => 'dj',
    ':password' => $djHashedPassword,
    ':email' => 'dj@alessio.fm',
    ':role' => 'dj'
]);

$stmt->execute([
    ':username' => 'manager',
    ':password' => $managerHashedPassword,
    ':email' => 'manager@alessio.fm',
    ':role' => 'event_manager'
]);

$organizerStmt = $pdo->prepare("SELECT user_id FROM users WHERE username = 'manager'");
$organizerStmt->execute();
$organizer = $organizerStmt->fetch(PDO::FETCH_ASSOC);
$organizerId = $organizer['user_id'];

$events = [
    [
        'name' => 'Summer Festival',
        'location' => 'Beach Park',
        'start_datetime' => '2024-06-15 12:00:00',
        'end_datetime' => '2024-06-15 23:00:00',
        'description' => 'The biggest summer festival with live music, food, and drinks.'
    ],
    [
        'name' => 'Tech Conference',
        'location' => 'Convention Center',
        'start_datetime' => '2024-07-20 09:00:00',
        'end_datetime' => '2024-07-20 18:00:00',
        'description' => 'Annual tech conference with speakers from around the world.'
    ],
    [
        'name' => 'Winter Wonderland',
        'location' => 'City Park',
        'start_datetime' => '2024-12-05 17:00:00',
        'end_datetime' => '2024-12-05 22:00:00',
        'description' => 'A festive event filled with lights, snow, and holiday spirit.'
    ],
    [
        'name' => 'Food Truck Fiesta',
        'location' => 'Downtown Plaza',
        'start_datetime' => '2024-08-12 11:00:00',
        'end_datetime' => '2024-08-12 20:00:00',
        'description' => 'Enjoy the best local food trucks all in one place.'
    ],
    [
        'name' => 'Marathon City',
        'location' => 'Main Street',
        'start_datetime' => '2024-09-22 06:00:00',
        'end_datetime' => '2024-09-22 12:00:00',
        'description' => 'Citywide marathon for charity, with participants from all over the region.'
    ],
    [
        'name' => 'Jazz Nights',
        'location' => 'Old Town',
        'start_datetime' => '2024-05-18 19:00:00',
        'end_datetime' => '2024-05-18 23:30:00',
        'description' => 'Experience an evening of smooth jazz from renowned artists.'
    ],
    [
        'name' => 'Book Fair',
        'location' => 'Library Grounds',
        'start_datetime' => '2024-04-25 10:00:00',
        'end_datetime' => '2024-04-25 17:00:00',
        'description' => 'Discover new authors and find your next great read.'
    ],
    [
        'name' => 'Art & Wine Festival',
        'location' => 'Vineyard Estate',
        'start_datetime' => '2024-10-03 12:00:00',
        'end_datetime' => '2024-10-03 20:00:00',
        'description' => 'A celebration of local art, fine wine, and community.'
    ],
    [
        'name' => 'Cinema Under the Stars',
        'location' => 'Riverbank Park',
        'start_datetime' => '2024-07-05 20:00:00',
        'end_datetime' => '2024-07-05 23:00:00',
        'description' => 'Outdoor movie night featuring classic films and family favorites.'
    ],
    [
        'name' => 'Halloween Haunt',
        'location' => 'Abandoned Warehouse',
        'start_datetime' => '2024-10-31 18:00:00',
        'end_datetime' => '2024-10-31 23:59:00',
        'description' => 'Scary fun with haunted houses, costume contests, and spooky surprises.'
    ],
    [
        'name' => 'Indie Film Showcase',
        'location' => 'Downtown Cinema',
        'start_datetime' => '2024-03-11 18:00:00',
        'end_datetime' => '2024-03-11 22:00:00',
        'description' => 'Screening of award-winning indie films followed by a Q&A session with the filmmakers.'
    ],
    [
        'name' => 'Eco Awareness Day',
        'location' => 'Community Center',
        'start_datetime' => '2024-04-22 09:00:00',
        'end_datetime' => '2024-04-22 17:00:00',
        'description' => 'A day of workshops, talks, and activities promoting sustainability and environmental conservation.'
    ]    
];

$eventSql = "INSERT INTO events (organizer_id, name, location, start_datetime, end_datetime, description) VALUES (:organizer_id, :name, :location, :start_datetime, :end_datetime, :description)";

$eventStmt = $pdo->prepare($eventSql);

foreach ($events as $event) {
    $eventStmt->execute([
        ':organizer_id' => $organizerId,
        ':name' => $event['name'],
        ':location' => $event['location'],
        ':start_datetime' => $event['start_datetime'],
        ':end_datetime' => $event['end_datetime'],
        ':description' => $event['description']
    ]);
}