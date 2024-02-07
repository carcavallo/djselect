<?php declare(strict_types=1);

namespace controller;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use PDOException;

class IOController
{
    protected Logger $logger;

    public function __construct()
    {
        $this->setupExceptionHandler();
        $this->initializeLogger();
    }

    private function setupExceptionHandler(): void
    {
        set_exception_handler(function ($error) {
            if ($error instanceof PDOException) {
                $this->writeLog($error->getMessage(), 500);
                $this->sendResponse("error", $error->getMessage(), 500);
            }
        });
    }

    private function initializeLogger(): void
    {
        $logFile = $this->getLogFilePath();
        $formatter = new LineFormatter("%datetime% %channel%.%level_name%: %message%\n");
        $handler = new StreamHandler($logFile, Logger::DEBUG);
        $handler->setFormatter($formatter);

        $this->logger = new Logger(get_class($this));
        $this->logger->pushHandler($handler);
    }

    private function getLogFilePath(): string
    {
        $timestamp = time();
        $monthName = date("F", $timestamp);
        return __DIR__ . "/../logs/" . strtolower($monthName) . ".log";
    }

    protected function checkPostArguments(array $args): void
    {
        $missingArgs = array_filter($args, function($arg) {
            return empty($_POST[$arg]) && !is_numeric($_POST[$arg]);
        });

        if (!empty($missingArgs)) {
            $this->sendResponse("error", "Required fields are missing.", 400, ["missing" => $missingArgs]);
        }

        array_walk($_POST, function(&$value) {
            if (is_string($value)) {
                $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            }
        });
    }

    public function sendResponse(string $status, string $message = "", int $code = 200, array $data = []): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            "status" => $status,
            "message" => $message,
            "data" => $data
        ]);
        exit();
    }

    public function writeLog(string $message, int $code = 200): void
    {
        $level = $this->logger::toMonologLevel($code);
        $context = ['user' => $_SESSION['username'] ?? 'anonymous'];
        $this->logger->log($level, $message, $context);
    }

    public function show404(): void 
    {
        $this->sendResponse("error", "The requested resource was not found.", 404);
    }
}
