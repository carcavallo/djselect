<?php declare(strict_types=1);

namespace controller;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use PDOException;
use Psr\Log\LogLevel;
use UnexpectedValueException;
use function util\replace;

class IOController
{
    protected Logger $logger;

    public function __construct()
    {
        set_exception_handler(function ($error) {
            if ($error instanceof PDOException) {
                $this->writeLog($error->getMessage(), null, 500);
                $this->sendResponse("error", $error->getMessage(), null, 500);
            }
        });

        $timestamp = time();
        $monthName = date("F", $timestamp);
        $logFile = __DIR__ . "/../logs/" . strtolower($monthName) . ".log";

        $formatter = new LineFormatter("%datetime% %channel%.%level_name%: %message%" . PHP_EOL);
        $handler = new StreamHandler($logFile, LogLevel::INFO);
        $handler->setFormatter($formatter);

        $this->logger = new Logger(get_called_class());
        $this->logger->pushHandler($handler);
    }

    protected function checkPostArguments(array $args): void
    {
        $error = false;
        $arguments = array();
        foreach ($args as $arg) {
            if (
                !array_key_exists($arg, $_POST) ||
                $_POST[$arg] === null ||
                $_POST[$arg] === ""
            ) {
                $error = true;
                $arguments[] = $arg;
            } elseif (is_string($_POST[$arg])) {
                $_POST[$arg] = htmlspecialchars(addslashes($_POST[$arg]));
            }
        }

        if ($error) {
            $this->sendResponse("error", "Sie haben nicht alle Felder ausgefüllt", array("arguments" => $arguments), 400);
        }
    }

    private function getLevel(int $code): Level
    {
        if ($code >= 200 && $code < 300) {
            return Level::Info;
        } elseif ($code >= 400 && $code < 500) {
            return Level::Warning;
        } elseif ($code >= 500 && $code < 600) {
            return Level::Error;
        }

        return Level::Critical;
    }

    public function sendResponse(string $status, string $message = "", array|object $data = null, int $code = 200, ?array $context = []): void
    {
        $response = array(
            "status" => $status
        );

        if (!empty($data)) {
            $response["data"] = $data;
        }

        if (strlen($message)) {
            if (isset($_SESSION["username"])) $this->writeLog($message, $context, $code);

            $message = replace($message, $context);
            $response["message"] = $message;
        }

        http_response_code($code);
        echo json_encode($response);
        exit();
    }

    public function writeLog(string $message, ?array $context = [], int $code = 200): void
    {
        $message = replace($message, $context);

        if (isset($_SESSION["username"])) {
            $message = "Benutzer: " . $_SESSION["username"] . " - " . $message;
        }

        try {
            $this->logger->addRecord($this->getLevel($code), $message);
        } catch (UnexpectedValueException) {
        }
    }

    public function show404(): void
    {
        header("Refresh: 3");

        $this->sendResponse("error", "Ich glaube Sie haben sich verlaufen", null, 404);
    }
}