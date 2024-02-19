<?php declare(strict_types=1);

error_reporting(E_ALL);

global $life_time;
global $delete_time;
global $file_size;

$life_time = 60 * 60 * 24 * 14;
$expire_time = time() + $life_time;
$delete_time = 60 * 60 * 24;

$file_size = 100000000;

ini_set("memory_limit", "512M");
ini_set("post_max_size", "256M");
ini_set("upload_max_filesize", "256M");
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

$router = new Router();
$router->setNamespace("controller");
$router->setBasePath("/api");

$router->set404("IOController@show404");

$router->before("GET|POST|PUT|DELETE", "/profiles*", "AuthController@checkLogin");
$router->before("GET|POST|PUT|DELETE", "/events*", "AuthController@checkLogin");
$router->before("GET|POST|PUT|DELETE", "/bookings*", "AuthController@checkLogin");


$router->mount("/auth", function () use ($router) {
    $router->post("/login", "AuthController@login");
    $router->post("/register", "AuthController@register");
    $router->post("/logout", "AuthController@logout");
    $router->post("/reset", "AuthController@requestPasswordReset");
});

$router->mount('/profiles', function () use ($router) {
    $router->post('/', 'ProfilesController@createProfile');
    $router->get('/{profileId}', 'ProfilesController@getProfile');
    $router->put('/{profileId}', 'ProfilesController@editProfile');
    $router->delete('/{profileId}', 'ProfilesController@deleteProfile');
});

$router->mount('/events', function () use ($router) {
    $router->post('/', 'EventsController@createEvent');
    $router->get('/{eventId}', 'EventsController@getEvent');
    $router->put('/{eventId}', 'EventsController@updateEvent');
    $router->delete('/{eventId}', 'EventsController@deleteEvent');
});

$router->mount('/bookings', function () use ($router) {
    $router->post('/', 'BookingsController@createBooking');
    $router->get('/{bookingId}', 'BookingsController@getBooking');
    $router->put('/{bookingId}', 'BookingsController@updateBooking');
    $router->delete('/{bookingId}', 'BookingsController@deleteBooking');
});

$router->run();
