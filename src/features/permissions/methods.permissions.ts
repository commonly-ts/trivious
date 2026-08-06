import { BaseCommandData, Component, MessageCommandData, TriviousClient } from "#typings";
import { GuildMember, PermissionFlagsBits, User } from "discord.js";

export function canMemberRunCommand(
	client: TriviousClient,
	command: BaseCommandData | Component | MessageCommandData,
	member: GuildMember | User
): [boolean, string] {
	const { permissions } = command;
	if (!permissions) return [true, "No permissions set"];
	if (!("nickname" in member)) return canUserRunCommand(client, command, member);

	// If the member is a bot owner or has Administrator permissions
	if (
		(client.trivious.ownerUserIds && client.trivious.ownerUserIds.includes(member.user.id)) ||
		member.permissions.has(PermissionFlagsBits.Administrator)
	)
		return [true, "User can run command; Administrator privileges"];

	const { requiredMemberPermissions, requiredRoleIds, userIds } = permissions;
	if (userIds) return canUserRunCommand(client, command, member.user);
	const permissionFlags = requiredMemberPermissions || permissions.permissionFlags;
	const roleIds = requiredRoleIds || permissions.roleIds;

	if (permissionFlags) {
		for (const bit of permissionFlags) {
			if (member.permissions.has(bit)) {
				return [true, "User can run command; Has required permission(s)"];
			}
		}
	}

	if (roleIds) {
		for (const roleId of roleIds) {
			if (member.roles.cache.has(roleId)) {
				return [true, "User can run command; Has required role(s)"];
			}
		}
	}

	return [false, "User cannot run command; Meets zero requirements"];
}

export function canUserRunCommand(
	client: TriviousClient,
	command: BaseCommandData | Component | MessageCommandData,
	user: User
): [boolean, string] {
	const { permissions } = command;
	if (!permissions) return [true, "No permissions set"];

	if (client.trivious.ownerUserIds && client.trivious.ownerUserIds.includes(user.id))
		return [true, "User can run command"];

	const { requiredMemberPermissions, requiredRoleIds, userIds } = permissions;
	const permissionFlags = requiredMemberPermissions || permissions.permissionFlags;
	const roleIds = requiredRoleIds || permissions.roleIds;

	if (!userIds && (permissionFlags || roleIds))
		return [false, "Cannot validate permissions; use canMemberRunCommand instead"];

	if (!userIds) return [true, "No permissions set"];
	return userIds.includes(user.id)
		? [true, "User can run command"]
		: [false, "User cannot run command"];
}
