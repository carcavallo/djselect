<?php declare(strict_types=1);

namespace util;

use ReflectionException;

/**
 * Removes all keys in the specified array that are not contained in the list of permitted keys.
 * If the values in the array are objects, they are converted back.
 *
 * @param array|object $modify The array or object whose keys are to be removed.
 * @param array $keys An array of keys that are to be retained.
 * @return array|object The array or object with only the permitted keys.
 * @throws ReflectionException Is thrown if the constructor of the class cannot be called without parameters.
 */
function removeArrayKeys(array|object $modify, array $keys): array|object
{
    $object = false;
    $class = null;
    if (is_object($modify) && method_exists($modify, "toArray")) {
        $object = true;
        $class = $modify::class;

        $modify = $modify->toArray();
    }

    foreach ($modify as $key => $value) {
        if (in_array($key, $keys)) {
            unset($modify[$key]);
        } elseif (is_object($value) || is_array($value)) {
            $modify[$key] = removeArrayKeys($value, $keys);
        }
    }

    if ($object && $class) {
        return (new $class())::fromArray($modify);
    }

    return $modify;
}

/**
 * Removes all occurrences of the specified value from the array.
 *
 * @param array $array The array from which the value is to be removed.
 * @param array $value The values to be removed.
 * @return array The array without the removed values.
 */
function removeArrayValues(array $array, array $value): array
{
    foreach ($array as $key => $val) {
        if (in_array($val, $value)) {
            unset($array[$key]);
        }
    }

    return array_values($array);
}

/**
 * Applies a callback function to the keys of an associative array.
 *
 * @param array $array The associative array whose keys are to be processed
 * @param callable $callback The callback function to be applied to each key
 * @return void
 */
function array_walk_keys(array &$array, callable $callback): void
{
    foreach ($array as $key => $value) {
        $new_key = $callback($key);
        if ($new_key !== $key) {
            unset($array[$key]);
            $array[$new_key] = $value;
        }
    }
}

/**
 * Replaces placeholders in the message with the actual value.
 *
 * @param string $message The message in which placeholders are to be replaced
 * @param array|null $context An associative array with key-value pairs to be used as placeholders in the message
 * @return string The new message with replaced placeholders
 */
function replace(string $message, array|null $context = []): string
{
    if (!empty($context)) {
        array_walk_keys($context, function ($key) {
            return "{" . $key . "}";
        });
        $message = strtr($message, $context);
    }

    return $message;
}