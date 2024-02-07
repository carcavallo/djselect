<?php declare(strict_types=1);

require_once __DIR__ . "/autoload.php";
require_once __DIR__ . "/vendor/autoload.php";

use Bramus\Router\Router;
use controller\IOController;

$router = new Router();

$router->get('/test', function() {
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Test route is working!']);
});

$router->set404(function() {
    $ioController = new IOController();
    $ioController->show404();
});

$router->run();
