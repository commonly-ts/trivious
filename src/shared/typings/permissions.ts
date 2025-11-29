import { GuildMember } from "discord.js";

export enum PermissionLevel {
	USER = 0,
	GUILD_STAFF = 1,
	GUILD_MODERATOR = 2,
	GUILD_ADMINISTRATOR = 3,
	GUILD_SUPER_ADMINISTRATOR = 4,
	GUILD_OWNER = 5,
	BOT_OWNER = 6,
}

const rolePermissions: Readonly<Record<string, PermissionLevel>> = {};

export const getPermissionLevel = (member: GuildMember) => {
	const highestRole = member.roles.highest;
	if (member.user.id === member.guild.ownerId) return PermissionLevel.GUILD_OWNER;

	return rolePermissions[highestRole.name] ?? PermissionLevel.USER;
};
