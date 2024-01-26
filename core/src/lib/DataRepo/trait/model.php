<?php declare(strict_types=1);

namespace lib\DataRepo\trait;

use lib\DataRepo\DataRepo;
use lib\DataRepo\feature\db_column;
use lib\DataRepo\feature\db_foreign_key;
use lib\DataRepo\feature\to_array;
use lib\DataRepo\feature\to_join;
use PDOException;
use ReflectionClass;
use ReflectionException;
use TypeError;

trait model
{
    /**
     * A method which returns the model as a JSON-serializable array.
     * @return array The resulting array.
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    // TODO: Comment
    public static function fromJSON(string $json): string|object
    {
        $object = json_decode($json);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $json;
        }

        return self::fromObject($object);
    }

    public static function fromObject(object $object): object
    {
        return static::fromCallback(function ($key) use ($object) {
            if (!isset($object->{$key})) return null;

            return $object->{$key};
        });
    }

    /**
     * Constructs a model instance from an array of objects.
     *
     * @param array $array The array which represents the Model with key value pairs.
     * @return self Returns itself to allow for chaining.
     */
    public static function fromArray(array $array): self
    {
        return static::fromCallback(function ($key) use ($array) {
            if (!isset($array[$key])) return null;

            return $array[$key];
        });
    }

    private static function fromCallback(callable $callable): self
    {
        $model = new (static::class)();
        $reflection = new ReflectionClass(static::class);

        foreach ($reflection->getProperties() as $property) {
            $propertyName = $property->getName();

            $value = $callable($propertyName);
            if ($value === null) continue;

            $attributes = $property->getAttributes();
            foreach ($attributes as $attribute) {
                if ($attribute->getName() === db_foreign_key::class && is_string($value)) {
                    $value = $attribute->getArguments()[0]::fromJSON($value);
                    break;
                }
            }

            try {
                $model->$propertyName = $value;
            } catch (TypeError $e) {
                $type = self::parseTypes($e->getMessage());
                switch ($type) {
                    case "bool":
                        $model->$propertyName = boolval($value);
                        break;
                    case "array":
                        $model->$propertyName = json_decode($value);
                        break;
                }
            }
        }

        return $model;
    }

    private static function parseTypes(string $text): string
    {
        preg_match("/of type (\??\w+)/", $text, $matches);

        return str_replace('?', '', $matches[1]);
    }

    /**
     * Returns the model as an associative array.
     *
     * @return array The resulting array.
     */
    public function toArray($dbName = false): array
    {
        $keyVal = [];

        $reflection = new ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            if (!isset($this->{$property->getName()})) continue;

            $attributes = $property->getAttributes(db_column::class);
            if (!count($attributes)) {
                $attributes = $property->getAttributes(to_array::class);
                if (count($attributes)) {
                    $keyVal[$property->getName()] = $this->{$property->getName()};
                }

                continue;
            }

            foreach ($attributes as $attribute) {
                $arguments = $attribute->getArguments();
                $field = (!count($arguments) || !$dbName)
                    ? $property->getName()
                    : $arguments[0];

                $keyVal[$field] = $this->{$property->getName()};
            }
        }

        return $keyVal;
    }

    /**
     * Returns the model's database ID.
     *
     * @return string|null The ID on success, `null` otherwise.
     */
    public function id(): mixed
    {
        return $this->{self::class::PRIMARY_KEY};
    }

    /**
     * Sets the model's database ID to a value.
     *
     * @param mixed $id The desired ID to be changed to.
     */
    public function setId(mixed $id): void
    {
        $this->{self::class::PRIMARY_KEY} = $id;
    }

    /**
     * Collects all database fields as an array.
     * Fields are returned if they're marked as a `db_column`.
     *
     * @return array The array of database fields.
     */
    public static function getDbFields(): array
    {
        $fields = [];

        $reflection = new ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            $attributes = $property->getAttributes(db_column::class);
            if (!count($attributes)) continue;

            foreach ($attributes as $attribute) {
                $arguments = $attribute->getArguments();
                $fields[] = (!count($arguments))
                    ? $property->getName()
                    : $arguments[0];
            }
        }
        return $fields;
    }

    public static function getDbColumn(string $propertyName): ?object
    {
        try {
            $class = new ReflectionClass(static::class);
            $property = $class->getProperty($propertyName);
        } catch (ReflectionException) {
            return null;
        }

        $column_attributes = $property->getAttributes(db_column::class);
        if (!count($column_attributes)) return null;

        $join_to_attributes = $property->getAttributes(to_join::class);
        return (object)[
            "sql" => count($column_attributes[0]->getArguments())
                ? $column_attributes[0]->getArguments()[0]
                : $property->getName(),
            "php" => count($join_to_attributes)
                ? $join_to_attributes[0]->getArguments()[0]
                : $property->getName()
        ];
    }

    /**
     * Collects the foreign key field which is connected to a specific model.
     * Field is returned if it's marked as a `db_foreign_key` and when it matches the defined second model.
     *
     * @param string $model The model name which should be found
     * @return object|null The name of the foreign key
     */
    public static function getForeignKey(string $model): ?object
    {
        $reflection = new ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            $attributes = $property->getAttributes(db_foreign_key::class);
            if (!count($attributes)) continue;

            foreach ($attributes as $attribute) {
                $arguments = $attribute->getArguments();
                if (!count($arguments) || $arguments[0] !== $model) continue;

                return self::getDbColumn($property->getName());
            }
        }
        return null;
    }

    /**
     * Joins two models at the defined foreign key.
     * A model is joined if it's marked as a `db_foreign_key` and when it matches the defined second model.
     *
     * @param string $model The model name which should be joined
     * @return self The joined model
     */
    public function join(string $model): self
    {
        $foreignKey = static::getForeignKey($model);

        if ($foreignKey) {
            $object = DataRepo::of($model)->select(
                where: [
                    $foreignKey->sql => ["=" => $this->{$foreignKey->sql}]
                ]
            );

            if (empty($object)) {
                throw new PDOException("No object found for model '$model' with ID '$foreignKey->sql'");
            }

            $this->{$foreignKey->php} = $object[0];
        }

        return $this;
    }
}
