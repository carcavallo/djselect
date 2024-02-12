<?php declare(strict_types=1);

error_reporting(E_ALL);

ini_set("memory_limit", "512M");
ini_set("post_max_size", "256M");
ini_set("upload_max_filesize", "256M");

$request_body = file_get_contents("php://input");
if (!empty($request_body)) {
    $_POST = json_decode($request_body, true, 512, JSON_BIGINT_AS_STRING);
}

header("Content-Type: application/json");
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
    (new IOController)->sendResponse("error", "Datenbank Server nicht erreichbar", 503);
};

$router = new Router();
$router->setNamespace("controller");
$router->setBasePath("/api");

$router->set404("IOController@show404");

$router->mount("/auth", function () use ($router) {
    $router->post("/register", "AuthController@register");
});

$router->run();
