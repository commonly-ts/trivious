import { GuildMember } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

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
	GUILD_OWNER = 4,
	BOT_OWNER = 5,
}

/**
 * Get the permission level of a user.
 *
 * @param {GuildMember} member
 * @returns {*}
 */
export const getPermissionLevel = (client: TriviousClient, member: GuildMember) => {
	const highestRole = member.roles.highest;
	if (member.user.id === member.guild.ownerId) return PermissionLevel.GUILD_OWNER;

	const rolePermissions = client.rolePermissions;
	return rolePermissions[highestRole.name] ?? PermissionLevel.USER;
};
