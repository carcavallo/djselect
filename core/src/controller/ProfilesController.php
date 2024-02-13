<?php

namespace controller;

use Exception;
use lib\DataRepo\DataRepo;
use trait\getter;
use model\Profile;
use function util\removeArrayKeys;
use function util\removeArrayValues;

class ProfilesController extends IOController
{
    use getter;

    /**
     * Creates a new profile with the details provided in the request body.
     * Validates required fields before creating the profile to ensure necessary data is present.
     * Excludes automatically generated or non-required fields like 'profile_id', 'created_at', and 'updated_at' from the input validation.
     * @return void
     * @throws Exception If there's an error during the database operation or required fields are missing.
     */
    public function createProfile(): void
    {
        $requiredFields = removeArrayValues(Profile::getDbFields(), ['profile_id', 'created_at', 'updated_at']);
        $this->checkPostArguments($requiredFields);

        $profile = Profile::fromArray($_POST);
        if (!DataRepo::insert($profile)) {
            $this->sendResponse("error", "Failed to create profile", null, 500);
            return;
        }

        $this->sendResponse("success", "Profile created successfully", removeArrayKeys($profile->toArray(), ['user_id']));
    }

    /**
     * Retrieves a profile based on the provided profile ID.
     * Returns the profile details if found, or an error message if the profile does not exist.
     * @param string $profileId The unique identifier of the profile to retrieve.
     * @return void
     * @throws Exception If there's an error during the database operation.
     */
    public function getProfile(string $profileId): void
    {
        $profile = DataRepo::of(Profile::class)->select(
            where: ['profile_id' => ['=' => $profileId]]
        );

        if (empty($profile)) {
            $this->sendResponse("error", "Profile not found", null, 404);
            return;
        }

        $this->sendResponse("success", "Profile retrieved successfully", $profile[0]->toArray());
    }

    /**
     * Updates an existing profile with the specified details provided in the request body.
     * Validates the profile ID to ensure the profile exists before attempting an update.
     * Prevents modification of immutable or key fields such as 'profile_id', 'user_id', 'created_at', and 'updated_at'.
     * @param string $profileId The unique identifier of the profile to be updated.
     * @return void
     * @throws Exception If there's an error during the database operation or if the profile does not exist.
     */
    public function editProfile(string $profileId): void
    {
        $profile = DataRepo::of(Profile::class)->select(
            where: ['profile_id' => ['=' => $profileId]]
        );

        if (empty($profile)) {
            $this->sendResponse("error", "Profile not found", null, 404);
            return;
        }

        $updateFields = $_POST;
        unset($updateFields['profile_id'], $updateFields['user_id'], $updateFields['created_at'], $updateFields['updated_at']);

        if (DataRepo::update($profile[0], $updateFields)) {
            $this->sendResponse("success", "Profile updated successfully");
        } else {
            $this->sendResponse("error", "Failed to update profile", null, 500);
        }
    }

    /**
     * Deletes a profile based on the provided profile ID.
     * Confirms the existence of the profile before proceeding with deletion. If the profile is found, it is deleted, and a success response is issued.
     * If the profile does not exist, an error message is returned.
     * @param string $profileId The unique identifier of the profile to be deleted.
     * @return void
     * @throws Exception If there's an error during the database operation or if the profile does not exist.
     */
    public function deleteProfile(string $profileId): void
    {
        $profile = DataRepo::of(Profile::class)->select(
            where: ['profile_id' => ['=' => $profileId]]
        );

        if (empty($profile)) {
            $this->sendResponse("error", "Profile not found", null, 404);
            return;
        }

        if (DataRepo::delete($profile[0])) {
            $this->sendResponse("success", "Profile deleted successfully");
        } else {
            $this->sendResponse("error", "Failed to delete profile", null, 500);
        }
    }
}
