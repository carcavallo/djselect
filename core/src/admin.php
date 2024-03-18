<?php
$hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
$pdo = new PDO('mysql:host=127.0.0.1;dbname=djselect', 'synopsis', 'toor');
$sql = "INSERT INTO users (username, password, email, role) VALUES (:username, :password, :email, :role)";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':username' => 'admin',
    ':password' => $hashedPassword,
    ':email' => 'admin@example.com',
    ':role' => 'administrator'
]);
