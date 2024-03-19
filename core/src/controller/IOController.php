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

    /**
     * Constructor of the class. Initializes a logger to write log entries to a file.
     * @return void
     */
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

    /**
     * Checks whether all required POST arguments are present and whether they are empty.
     * If an argument is missing or empty, an error message is returned.
     * @param array $args An array with all required arguments.
     * @return void
     */
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
            $this->sendResponse("error", "You have not filled in all fields", array("arguments" => $arguments), 400);
        }
    }

    /**
     * Returns a level object based on the specified HTTP status code.
     * @param int $code The HTTP status code.
     * @return Level The level object associated with the specified status code.
     */
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

    /**
     * Sends an HTTP response as a JSON object and writes the corresponding log entry.
     * @param string $status The status of the response ("success" or "error").
     * @param string $message A message to be returned in the response.
     * @param array|object|null $data An associative array or object containing the data to be returned in the response.
     * @param int $code The HTTP status code of the response.
     * @param array|null $context An associative array that replaces placeholders in the message.
     * @return void
     */
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

    /**
     * Writes a log message with the specified code and message to the log file.
     * The optional context variable makes it possible to replace placeholders in the message with the actual value.
     * @param string $message The message to be written
     * @param array|null $context An optional associative array with key-value pairs to be used as placeholders in the message
     * @param int $code The code of the log message to indicate the severity of the message
     * @return void
     */
    public function writeLog(string $message, ?array $context = [], int $code = 200): void
    {
        $message = replace($message, $context);

        if (isset($_SESSION["username"])) {
            $message = "User: " . $_SESSION["username"] . " - " . $message;
        }

        try {
            $this->logger->addRecord($this->getLevel($code), $message);
        } catch (UnexpectedValueException) {
        }
    }

    /**
     * Returns an error message that the requested resource was not found.
     * @return void
     */
    public function show404(): void
    {
        header("Refresh: 3");

        $this->sendResponse("error", "The requested resource was not found", null, 404);
    }
}