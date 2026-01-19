import { GuildMember } from "discord.js";
import { PermissionLevel } from "../typings/index.js";
import TriviousClient from "src/core/client/trivious.client.js";

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
