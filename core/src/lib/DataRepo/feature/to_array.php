<?php declare(strict_types=1);

namespace lib\DataRepo\feature;

use Attribute;

/**
 * The to_array attribute is used to specify the property name in the model class which should be included in the array.
 * This attribute is applied to the target property of a class using the #[Attribute(Attribute::TARGET_PROPERTY)] syntax.
 * When instantiating an object of the model, the db_column attribute is used to map the property name to its corresponding
 * column name in the database. This is particularly useful when the property name differs from the column name in the database.
 * @property string $column_name The name of the column in the database that corresponds to the target property.
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
final class to_array {}