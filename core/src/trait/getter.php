<?php

namespace trait;

use lib\DataRepo\DataRepo;
use model\User;
use controller\AuthController;

trait getter
{
	/**
	 * Returns the user with the specified ID.
	 * If no user with the specified ID is found, an error message is returned.
	 * If the user ID matches the current session and no user is found, the user is logged out and an error message is returned.
	 * @param string $id The ID of the user
	 * @return object The user object with the specified ID
	 */
	protected function _getUser(string $id): object
	{
		$user = DataRepo::of(User::class)->select(
			where: [
				"user_id" => ["=" => $id]
			]
		);

		if (empty($user)) {
			if ($id === $_SESSION["user_id"]) {
				(new AuthController())->logout(false);
				$this->sendResponse("error", "Dieses Konto ist ungültig", null, 403);
			}
			$this->sendResponse("error", "BenutzerID {id} nicht bekannt", null, 400, ["id" => $id]);
		}

		return $user[0];
	}
}