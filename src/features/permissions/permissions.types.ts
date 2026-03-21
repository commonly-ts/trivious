import { PermissionsBitField } from "discord.js";

export interface CommandPermissionValues {
	requiredRoleIds?: string[];
	requiredMemberPermissions?: PermissionsBitField[];
	userIds: string[];
}
