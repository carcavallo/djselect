<?php declare(strict_types=1);

error_reporting(E_ALL);

global $life_time;

$life_time = 3600;
$expire_time = time() + $life_time;

ini_set("session.gc_maxlifetime", (string)$life_time);
ini_set("session.save_path", __DIR__ . "/sessions");

session_start();

if (!isset($_COOKIE[session_name()]) || !isset($_SESSION["expires"]) || $_SESSION["expires"] < $expire_time) {
    $expires = time() + $life_time;

    setcookie(session_name(), session_id(), $expires, "/");
    $_SESSION["expires"] = $expires;
}

$request_body = file_get_contents("php://input");
if (!empty($request_body)) {
    $_POST = json_decode($request_body, true, 512, JSON_BIGINT_AS_STRING);
}

header("Content-Type: application/json");
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

date_default_timezone_set("Europe/Zurich");

require_once __DIR__ . "/autoload.php";
require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/util/utils.php";

use Bramus\Router\Router;
use controller\IOController;
use lib\DataRepo\DataRepo;

set_exception_handler(function (Throwable $error) {
    (new IOController)->writeLog($error->getMessage(), 500);
});

DataRepo::$callbackError = function () {
    (new IOController)->sendResponse("error", "Database server not accessible", 503);
};

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$router = new Router();
$router->setNamespace("controller");
$router->setBasePath("/api");

$router->set404("IOController@show404");

$router->mount("/auth", function () use ($router) {
    $router->post("/login", "AuthController@login");
    $router->post("/register", "AuthController@register");
    $router->get('/session', "AuthController@getSession");
    $router->post("/logout", "AuthController@logout");
    $router->post("/reset", "AuthController@requestPasswordReset");
    $router->post("/reset/confirm", "AuthController@confirmResetPassword");
});

$router->mount('/users', function () use ($router) {
    $router->get('/', 'UsersController@getUsers');
    $router->get('/{userId}', 'UsersController@getUser');
    $router->put('/{userId}', 'UsersController@updateUser');
    $router->delete('/{userId}', 'UsersController@deleteUser');
});

$router->mount('/events', function () use ($router) {
    $router->post('/', 'EventsController@createEvent');
    $router->get('/', 'EventsController@getEvents');
    $router->get('/{eventId}', 'EventsController@getEvent');
    $router->put('/{eventId}', 'EventsController@updateEvent');
    $router->delete('/{eventId}', 'EventsController@deleteEvent');
});

$router->get('/user-events/{userId}', 'EventsController@getUserEvents');

$router->mount('/bookings', function () use ($router) {
    $router->post('/', 'BookingsController@createBooking');
    $router->get('/{userId}', 'BookingsController@getBookings');
    $router->put('/{bookingId}', 'BookingsController@updateBooking');
    $router->delete('/{bookingId}', 'BookingsController@deleteBooking');
});

$router->get('/event-bookings/{eventId}', 'BookingsController@getBookingsByEventId');

$router->run();