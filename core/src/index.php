<?php declare(strict_types=1);

session_start();

$lifetime = 60 * 60 * 24 * 7;
$expire_time = time() + 60 * 60 * 12;

ini_set("memory_limit", "512M");
ini_set("post_max_size", "256M");
ini_set("upload_max_filesize", "256M");
ini_set("session.gc_maxlifetime", (string)$lifetime);
ini_set("session.save_path", __DIR__ . "/sessions");

if (!isset($_COOKIE[session_name()]) || !isset($_SESSION["expires"]) || $_SESSION["expires"] < $expire_time) {
    $expires = time() + $lifetime;
    setcookie(session_name(), session_id(), $expires, "/");
    $_SESSION["expires"] = $expires;
}

$request_body = file_get_contents("php://input");
if (!empty($request_body)) {
    $_POST = json_decode($request_body, true, 512, JSON_BIGINT_AS_STRING);
}

header("Content-Type: application/json");
date_default_timezone_set("Europe/Zurich");

require_once __DIR__ . "/autoload.php";
require_once __DIR__ . "/vendor/autoload.php";

use Bramus\Router\Router;
use controller\IOController;

set_exception_handler(function (Throwable $error) {
    (new IOController)->writeLog($error->getMessage(), null, 500);
});

$router = new Router();
$router->setNamespace("controller");
$router->setBasePath("/api");

$router->get('/test', function() {
    echo json_encode(['message' => 'Test route is working!']);
});

$router->set404(function() {
    (new IOController)->show404();
});

$router->mount("/auth", function () use ($router) {
    $router->post("/login", "AuthController@login");
    $router->post("/register", "AuthController@register");
    $router->post("/logout", "AuthController@logout");
});

$router->mount("/user", function () use ($router) {
    $router->get("/{userId}", "UserController@getUserDetails");
    $router->post("/", "UserController@createUser");
    $router->put("/{userId}", "UserController@updateUser");
    $router->delete("/{userId}", "UserController@deleteUser");
});

$router->mount("/event", function () use ($router) {
    $router->post("/", "EventController@createEvent");
});

$router->mount("/booking", function () use ($router) {

});

$router->mount("/review", function () use ($router) {
    
});

$router->run();
