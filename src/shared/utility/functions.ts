import { promises as fs, existsSync } from "fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getPermissionLevel, PermissionLevel } from "../typings/permissions.js";
import { GuildMember, User } from "discord.js";
import TriviousClient from "src/core/client/trivious.client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the package root.
 *
 * @returns {string}
 */
const getPackageRoot = (): string => {
	let dir = __dirname;

	while (dir !== dirname(dir)) {
		if (existsSync(join(dir, "package.json")) || existsSync(join(dir, "node_modules"))) {
			return dir;
		}
		dir = dirname(dir);
	}
	return __dirname;
};

/**
 * Framework package root.
 *
 * @type {string}
 */
export const FRAMEWORK_PACKAGE_ROOT = getPackageRoot();

/**
 * Get the core path.
 *
 * @export
 * @param {{ userPath?: string; coreDirectory: string }} options
 * @returns {string}
 */
export function getCorePath(options: { userPath?: string; coreDirectory: string }): string {
	const { userPath, coreDirectory } = options;
	if (userPath) {
		return resolveUserPath(userPath);
	}

	const builtInCandidates = [
		join(FRAMEWORK_PACKAGE_ROOT, "lib", coreDirectory),
		join(FRAMEWORK_PACKAGE_ROOT, "dist", coreDirectory),
	];

	for (const candidate of builtInCandidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return join(FRAMEWORK_PACKAGE_ROOT, "lib", coreDirectory);
}

/**
 * Resolve a user given core path.
 *
 * @export
 * @param {string} relativePath
 * @returns {string}
 */
export function resolveUserPath(relativePath: string): string {
	const candidates = [
		join(process.cwd(), relativePath),

		join(process.cwd(), "lib", relativePath),
		join(process.cwd(), "dist", relativePath),

		join(FRAMEWORK_PACKAGE_ROOT, relativePath),
		join(FRAMEWORK_PACKAGE_ROOT, "lib", relativePath),
		join(FRAMEWORK_PACKAGE_ROOT, "dist", relativePath),
	];

	for (const candidate of candidates) {
		const full = resolve(candidate);
		if (existsSync(full)) return full;
	}

	return join(process.cwd(), relativePath);
}

/**
 * Whether a directory or file  exists.
 *
 * @export
 * @async
 * @param {string} path
 * @returns {unknown}
 */
export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Whether a user/member has permission.
 *
 * @export
 * @param {{
 * 	permission: PermissionLevel;
 * 	user?: User;
 * 	member?: GuildMember;
 * }} options
 * @returns {boolean}
 */
export function hasPermission(
	client: TriviousClient,
	options: {
		permission: PermissionLevel;
		user?: User;
		member?: GuildMember;
	}
) {
	const { permission, user, member } = options;

	if (user) {
		if (permission === PermissionLevel.BOT_OWNER) {
			return !(user.id === "424764032667484171");
		}
		return true;
	}

	if (member) {
		const memberPermission = getPermissionLevel(client, member);
		return permission > memberPermission;
	}

	return false;
}
