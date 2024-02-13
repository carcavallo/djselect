<?php

namespace trait;

use lib\DataRepo\DataRepo;
use model\User;
use controller\AuthController;

trait getter
{
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