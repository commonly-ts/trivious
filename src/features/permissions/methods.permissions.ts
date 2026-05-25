import { BaseCommandData, Component, TriviousClient } from "@typings";
import { GuildMember, User } from "discord.js";

export function canMemberRunCommand(
	client: TriviousClient,
	command: BaseCommandData | Component,
	member: GuildMember
): [boolean, string] {
	const { permissions } = command;
	if (!permissions) return [true, "No permissions set"];

	if (client.trivious.ownerUserIds && client.trivious.ownerUserIds.includes(member.user.id))
		return [true, "User can run command"];

	const { requiredMemberPermissions, requiredRoleIds, userIds } = permissions;
	if (userIds) return canUserRunCommand(client, command, member.user);

	let memberHasPermission = false;
	let memberHasRole = false;

	if (requiredMemberPermissions) {
		for (const bit of requiredMemberPermissions) {
			if (member.permissions.has(bit)) {
				memberHasPermission = true;
				break;
			}
		}
	}

	if (requiredRoleIds) {
		for (const roleId of requiredRoleIds) {
			if (member.roles.cache.has(roleId)) {
				memberHasRole = true;
				break;
			}
		}
	}

	return memberHasPermission || memberHasRole
		? [true, "User can run command"]
		: [false, "User cannot run command"];
}

export function canUserRunCommand(
	client: TriviousClient,
	command: BaseCommandData | Component,
	user: User
): [boolean, string] {
	const { permissions } = command;
	if (!permissions) return [true, "No permissions set"];

	if (client.trivious.ownerUserIds && client.trivious.ownerUserIds.includes(user.id))
		return [true, "User can run command"];

	const { requiredMemberPermissions, requiredRoleIds, userIds } = permissions;

	if (!userIds && (requiredMemberPermissions || requiredRoleIds))
		return [false, "Cannot validate permissions; use canMemberRunCommand instead"];

	if (!userIds) return [true, "No permissions set"];
	return userIds.includes(user.id)
		? [true, "User can run command"]
		: [false, "User cannot run command"];
}
