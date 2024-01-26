<?php declare(strict_types=1);

global $lifetime;

$lifetime = 60 * 60 * 24 * 7;
$expire_time = time() + 60 * 60 * 12;

ini_set("memory_limit", "512M");
ini_set("post_max_size", "256M");
ini_set("upload_max_filesize", "256M");
ini_set("session.gc_maxlifetime", (string) $lifetime);
ini_set("session.save_path", __DIR__ . "/sessions");

session_start();

if (!isset($_COOKIE[session_name()]) || !isset($_SESSION["expires"]) || $_SESSION["expires"] < $expire_time) {
    $expires = time() + $lifetime;

    setcookie(session_name(), session_id(), $expires, "/");
    $_SESSION["expires"] = $expires;
}

$request_body = file_get_contents("php://input");
if (!empty($request_body)) $_POST = json_decode($request_body, true, 512, JSON_BIGINT_AS_STRING);

header("Content-Type: application/json");
date_default_timezone_set("Europe/Zurich");

require_once __DIR__ . "/autoload.php";
require_once __DIR__ . "/vendor/autoload.php";

use Bramus\Router\Router;
use lib\DataRepo\DataRepo;
use controller\IOController;

set_exception_handler(function (Throwable $error) {
	(new IOController)->writeLog($error->getMessage(), null, 500);
});

DataRepo::$callbackError = function (Exception $exception) {
    (new IOController)->writeLog($exception->getMessage(), null, 503);
	(new IOController)->sendResponse("error", "Datenbank Server nicht erreichbar: " . $exception->getMessage(), null, 503);
};

$router = new Router();
$router->setNamespace("controller");
$router->setBasePath("/api");

$router->set404("IOController@show404");

$router->run();