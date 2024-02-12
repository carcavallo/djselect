<?php declare(strict_types=1);

namespace util;

use ReflectionException;

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

function removeArrayValues(array $array, array $value): array
{
    foreach ($array as $key => $val) {
        if (in_array($val, $value)) {
            unset($array[$key]);
        }
    }

    return array_values($array);
}

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