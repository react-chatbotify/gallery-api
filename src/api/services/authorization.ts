import { UserData } from "../interfaces/UserData";

/**
 * Checks if a user is an admin.
 *
 * @param userData user data to refer to
 *
 * @returns true if user is admin, false otherwise
 */
const checkIsAdminUser = (userData: UserData) => {
	return userData.role.toUpperCase() === "ADMIN";
}

export {
	checkIsAdminUser
};
