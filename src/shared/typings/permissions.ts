import { GuildMember } from "discord.js";

/**
 * User permission level enums
 *
 * @export
 * @enum {number}
 */
export enum PermissionLevel {
	USER = 0,
	GUILD_STAFF = 1,
	GUILD_MODERATOR = 2,
	GUILD_ADMINISTRATOR = 3,
	GUILD_SUPER_ADMINISTRATOR = 4,
	GUILD_OWNER = 5,
	BOT_OWNER = 6,
}

/**
 * Roles tied to a PermissionLevel.
 *
 * @type {Readonly<Record<string, PermissionLevel>>}
 */
const rolePermissions: Readonly<Record<string, PermissionLevel>> = {};

/**
 * Get the permission level of a user.
 *
 * @param {GuildMember} member
 * @returns {*}
 */
export const getPermissionLevel = (member: GuildMember) => {
	const highestRole = member.roles.highest;
	if (member.user.id === member.guild.ownerId) return PermissionLevel.GUILD_OWNER;

	return rolePermissions[highestRole.name] ?? PermissionLevel.USER;
};
