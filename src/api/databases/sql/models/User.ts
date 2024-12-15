import { DataTypes, Model } from "sequelize";

import { sequelize } from "../sql";

/**
 * Stores the data of users.
 */
class User extends Model { }

User.init({
	// id to uniquely identify the user
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	// email, also uniquely identifies the user
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	// the role of the user
	role: {
		type: DataTypes.ENUM("USER", "MODERATOR", "ADMIN"),
		defaultValue: "USER",
		allowNull: false
	},
	// date when the user accepted the author agreement (necessary to publish themes/plugins)
	acceptedAuthorAgreement: {
		type: DataTypes.DATE,
		allowNull: true,
		defaultValue: null, // default to null which is not agreed yet
		field: "accepted_author_agreement"
	},
	// date when user was created
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: sequelize.literal("NOW()"),
		field: "created_at"
	},
	// date when user was last updated
	updatedAt: {
		type: DataTypes.DATE,
		defaultValue: sequelize.literal("NOW()"),
		field: "updated_at"
	}
}, {
	sequelize,
	modelName: "User",
	timestamps: false
});

export default User;