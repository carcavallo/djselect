<?php declare(strict_types=1);

namespace lib\DataRepo;

use Exception;
use PDO;
use PDOException;

/**
 * Class DataRepo
 *
 * This class is an ORM for any SQL database.
 * It allows for easy creation, deletion, and updating of models.
 *
 * @author Bernardo de Oliveira <bernardo@bernardo.fm>
 * @package lib\DataRepo
 *
 * @method bool delete(array $where = [])
 * @method static bool delete(mixed $models = null)
 */
class DataRepo
{
	private static array $operators = ["=", "<", ">", "<=", ">=", "<>", "!=", "LIKE", "NOT LIKE"];
	private static array $functions = ["COUNT"];

	private mixed $class;

	public static mixed $callback;
	public static mixed $callbackError;

	/**
	 * Constructor for the DataRepo class.
	 *
	 * @param string $class The name of the model class to be used by this repo.
	 */
	public function __construct(string $class)
	{
		$this->class = $class;
	}

	/**
	 * A helper factory method for creating a new `DataRepo` instance
	 * that immediately sets the model type and sets up the repo for
	 * handy chaining calls.
	 *
	 * @param string $class The name of the class to be instantiated.
	 * @return DataRepo The resulting instance.
	 */
	public static function of(string $class): DataRepo
	{
		return new static($class);
	}

	// Magic method for non-static calls
	public function __call($name, $arguments)
	{
		if ($name == "delete") {
			return $this->deleteInstance(...$arguments);
		}

		return $this->$name(...$arguments);
	}

	// Magic method for static calls
	public static function __callStatic($name, $arguments)
	{
		if ($name == "delete") {
			return self::deleteStatic(...$arguments);
		}

		return self::$name(...$arguments);
	}

	// TODO: Comment
	public function select(array $select = [], array $join = [], array $where = [], array $orderBy = null, int $limit = null, int $offset = null): array|null
	{
		foreach ($select as $field) {
			if (is_array($field) && !in_array(key($field), $join)) {
				throw new PDOException("Invalid select table: " . key($field));
			}
		}

		$fields = $this->generate_fields($select, $join);

		$sql = "SELECT " . $fields . " FROM " . $this->class::TABLE_NAME;
		$keyVal = [];

		$allowedFields = $this->class::getDbFields();
		foreach ($join as $table) {
			[$table_name, , $primary_key, $foreign_key] = $this->get_table_info($table);

			$sql .= " JOIN $table_name ON " . $this->class::TABLE_NAME . ".$foreign_key->sql = $table_name.$primary_key";
		}

		// WHERE Clause
		if (!empty($where)) {
			$generated = $this->generate_where($where, $allowedFields);

			$sql .= " WHERE " . $generated["sql"];
			$keyVal = array_merge($keyVal, $generated["keyVal"]);

			$sql = rtrim($sql, " AND ");
		}

		// ORDER BY Clause
		if (!empty($orderBy)) {
			$sql .= " ORDER BY ";
			$orderStrings = [];
			foreach ($orderBy as $column => $direction) {
				if (!in_array($column, $allowedFields)) {
					throw new PDOException("Invalid order column: " . $column);
				}

				$direction = strtoupper($direction);
				if (!in_array($direction, ["ASC", "DESC"])) {
					throw new PDOException("Invalid order direction: " . $direction);
				}
				$orderStrings[] = "$column $direction";
			}
			$sql .= implode(", ", $orderStrings);
		}

		// LIMIT Clause
		if ($limit !== null) {
			$sql .= " LIMIT :__limit";
			$keyVal[":__limit"] = $limit;
		}

		// OFFSET Clause
		if ($offset !== null) {
			$sql .= " OFFSET :__offset";
			$keyVal[":__offset"] = $offset;
		}

		// Execute Query
		$stmt = self::getPDO()->prepare($sql);

		foreach ($keyVal as $key => $value) {
			if (is_bool($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_BOOL);
			} elseif (is_int($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_INT);
			} else $stmt->bindValue($key, $value);
		}

		try {
			$stmt->execute();
			$result = $stmt->fetchAll();
		} catch (PDOException $e) {
			if ($e->getCode() !== "42 S02") {
				throw new PDOException("Error selecting data: " . $e->getMessage());
			}
			error_log("Error selecting data: " . $e->getMessage());
			return null;
		}

		if ($result === false) {
			return null;
		}

		return array_map(fn($row) => $this->class::fromArray($row), $result);
	}

	/**
	 * Inserts a model into the respective table.
	 * This function uses the serializeFields function to ensure that any object
	 * or array values in the model are properly serialized before insertion into the database.
	 *
	 * @param mixed &$model The model to be serialized and inserted.
	 * @return bool Returning the success state of the sql.
	 */
	public static function insert(mixed $model): bool
	{
		$keyVal = $model->toArray(true);
		self::serializeFields($keyVal);

		$sql = "INSERT INTO " . $model::TABLE_NAME . " (" . implode(", ", array_keys($keyVal))
			. ") VALUES (:" . implode(", :", array_keys($keyVal)) . ") RETURNING " . $model::PRIMARY_KEY;

		$dbh = self::getPDO();
		$stmt = $dbh->prepare($sql);

		foreach ($keyVal as $key => $value) {
			if (is_bool($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_BOOL);
			} elseif (is_int($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_INT);
			} else $stmt->bindValue($key, $value);
		}

		try {
			$success = $stmt->execute();
			$model->setId($stmt->fetchColumn());
		} catch (PDOException $e) {
			error_log("Error inserting data: " . $e->getMessage());
			return false;
		}

		return $success;
	}

	/**
	 * Updates a model in the respective table.
	 * This function uses the serializeFields function to ensure that any object
	 * or array values in the model are properly serialized before updating the database.
	 * It also appends an artificial key with the value for the primary key, as there can be no multiple named
	 * parameters bound to the same array field.
	 *
	 * @param mixed $model The model to be updated.
	 * @return bool Whether the update was successful or not.
	 */
	public static function update(mixed $model): bool
	{
		$keyVal = $model->toArray(true);
		unset($keyVal[$model::PRIMARY_KEY]);

		self::serializeFields($keyVal);

		$mapFn = fn($key) => $key . " = :" . $key;
		$sql = "UPDATE " . $model::TABLE_NAME . " SET " . implode(", ", array_map($mapFn, array_keys($keyVal)))
			. " WHERE " . $model::PRIMARY_KEY . " = :__id";

		$stmt = self::getPDO()->prepare($sql);
		$keyVal[":__id"] = $model->id();

		foreach ($keyVal as $key => $value) {
			if (is_bool($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_BOOL);
			} elseif (is_int($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_INT);
			} else $stmt->bindValue($key, $value);
		}

		try {
			return $stmt->execute();
		} catch (PDOException $e) {
			error_log("Error updating model: " . $e->getMessage());
			return false;
		}
	}

	// TODO: Comment
	private static function deleteStatic(mixed $models = null): bool
	{
		if (empty($models)) {
			return true;
		}

		$models = is_array($models) ? $models : [$models];

		$pdo = self::getPDO();
		$pdo->beginTransaction();
		try {
			foreach ($models as $model) {
				$sql = "DELETE FROM " . $model::TABLE_NAME . " WHERE " . $model::PRIMARY_KEY . " = :__id";
				$stmt = $pdo->prepare($sql);
				$result = $stmt->execute([
					":__id" => $model->id()
				]);

				if (!$result) {
					$pdo->rollBack();
					return false;
				}
			}
			$pdo->commit();
			return true;
		} catch (PDOException $e) {
			$pdo->rollBack();

			error_log("Error deleting data: " . $e->getMessage());
			return false;
		}
	}

	// TODO: Comment
	private function deleteInstance(array $where = []): bool
	{
		$sql = "DELETE FROM " . $this->class::TABLE_NAME . " WHERE ";
		$keyVal = [];

		if (empty($where)) {
			throw new PDOException("No where clause provided.");
		}

		$generated = $this->generate_where($where, $this->class::getDbFields());

		$sql .= $generated["sql"];
		$sql = rtrim($sql, " AND ");

		$stmt = self::getPDO()->prepare($sql);

		$keyVal = array_merge($keyVal, $generated["keyVal"]);

		foreach ($keyVal as $key => $value) {
			if (is_bool($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_BOOL);
			} elseif (is_int($value)) {
				$stmt->bindValue($key, $value, PDO::PARAM_INT);
			} else $stmt->bindValue($key, $value);
		}

		try {
			return $stmt->execute();
		} catch (PDOException $e) {
			error_log("Error deleting data: " . $e->getMessage());
			return false;
		}
	}

	// TODO: Comment
	private function generate_fields(array $select = [], array $join = []): string
	{
		$generated_fields = "";
		$select_table = $this->class::TABLE_NAME;

		foreach ($select as $select_field) {
			if (is_array($select_field)) {
				$table = key($select_field);
				$fields = $select_field[$table];

				[$table_name, $allowed_fields, , $foreign_key] = $this->get_table_info($table);

				foreach ($fields as $field) {
					if (!in_array($field, $allowed_fields)) {
						throw new PDOException("Invalid field: $field for table: $table_name");
					}
				}

				$generated_fields .= "JSON_OBJECT(" . implode(", ", array_map(fn($field) => "'$field', $table_name.$field", $fields)) . ") AS $foreign_key->php, ";
			} else {
				$allowed_fields = $this->class::getDbFields();
				if (in_array($select_field, $allowed_fields)) {
					$generated_fields .= "$select_table.$select_field, ";
				} else {
					$function = preg_replace("/\([^)]*\)/", "", $select_field);
					if (in_array($function, self::$functions)) {
						$generated_fields .= "$select_field AS " . strtolower($function) . ", ";
					} else {
						throw new PDOException("Invalid field: $select_field for table: $select_table");
					}
				}
			}
		}

		if (empty($select)) {
			$generated_fields = "$select_table.*, ";
			foreach ($join as $table) {
				[$table_name, $fields, , $foreign_key] = $this->get_table_info($table);

				$generated_fields .= "JSON_OBJECT(" . implode(", ", array_map(fn($field) => "'$field', $table_name.$field", $fields)) . ") AS " . $foreign_key->php . ", ";
			}
		}

		return rtrim($generated_fields, ", ");
	}

	// TODO: Comment
	private function generate_where(array $where = [], array $allowedFields = [], &$keyVal = [], &$sql = ""): array
	{
		$table_name = $this->class::TABLE_NAME;
		$i = 0;

		foreach ($where as $column => $operator_value) {
            if (!is_int($column)) {
                if (!in_array($column, $allowedFields)) {
                    throw new PDOException("Invalid column: " . $column);
                }

                $this->recursive_operator_value($operator_value, $table_name, $column, $keyVal, $sql, $i);
                if (!str_ends_with($sql, " AND ") && !str_ends_with($sql, " OR ")) {
                    $sql .= " AND ";
                }
            } else $this->generate_where($operator_value, $allowedFields, $keyVal, $sql);
		}

		return ["sql" => $sql, "keyVal" => $keyVal];
	}

	private function recursive_operator_value($operator_value, $table_name, $column, &$keyVal, &$sql, &$i): void
	{
		foreach ($operator_value as $operator => $value) {
			if (in_array($value, ["AND", "OR"]) &&  is_int($operator)) {
				$sql .= " $value ";
				continue;
			}

			if (is_array($value) && is_int($operator)) {
				$this->recursive_operator_value($value, $table_name, $column, $keyVal, $sql, $i);
				continue;
			}


			if (!in_array($operator, self::$operators)) {
				throw new PDOException("Invalid operator: " . $operator);
			}

			$placeholderValue = ":__value" . $i;

			$sql .= "$table_name.$column $operator $placeholderValue";
			$keyVal[$placeholderValue] = $value;

			$i++;
		}
	}

	// TODO: Comment
	private function get_table_info(string $table): array
	{
		$table_class = (new static($table))->class;
		$foreign_key = $this->class::getForeignKey($table);

		if (!$foreign_key) {
			throw new PDOException("No foreign key found for table: " . $table);
		}

		return [
			$table_class::TABLE_NAME,
			$table_class::getDbFields(),
			$table_class::PRIMARY_KEY,
			$foreign_key
		];
	}

	/**
	 * Serializes fields of a model in case they are objects or arrays.
	 * This allows them to be stored in the database.
	 *
	 * @param array &$keyVal The associative array containing keys and their values.
	 */
	private static function serializeFields(array &$keyVal): void
	{
		foreach ($keyVal as $key => $val) {
			if (is_object($val) || is_array($val)) {
				$encoded = json_encode($val);
				if (json_last_error() === JSON_ERROR_NONE) {
					$keyVal[$key] = $encoded;
				}
			} elseif (empty($val) && !is_int($val) && !is_bool($val)) {
				unset($keyVal[$key]);
			}
		}
	}


	/**
	 * Attempts to create and return a PDO connection to the MySQL database.
	 * @return PDO|null The created PDO instance on success, null otherwise.
	 */
	/**
	 * Attempts to create and return a PDO connection to the MySQL database.
	 * @return PDO|null The created PDO instance on success, null otherwise.
	 */
	private static function getPDO(): PDO|null
	{
		try {
			if (isset(self::$callback) && is_callable(self::$callback)) (self::$callback)();
			return new PDO(
				"mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'] . ";charset=utf8",
				$_ENV['DB_USER'],
				$_ENV['DB_PASSWORD'],
				[
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
					PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
					PDO::ATTR_EMULATE_PREPARES => true,
				]
			);
		} catch (Exception $e) {
			if (isset(self::$callbackError) && is_callable(self::$callbackError)) (self::$callbackError)($e);
		}
		return null;
	}
}