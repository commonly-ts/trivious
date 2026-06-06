export interface CommandPermissionValues {
	/**
	 * @deprecated Use roleIds instead
	 */
	requiredRoleIds?: string[];
	/**
	 * @deprecated Use permissionFlags instead
	 */
	requiredMemberPermissions?: bigint[];
	permissionFlags?: bigint[];
	roleIds?: string[];
	userIds?: string[];
}
