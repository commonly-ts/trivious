import TriviousClient from "src/core/client/trivious.client.js";
import { promises as fs, existsSync } from "fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getPermissionLevel, PermissionLevel } from "../typings/permissions.js";
import { GuildMember, RESTPostAPIApplicationCommandsJSONBody, User } from "discord.js";

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
export function getCorePath(options: {
	userPath?: string;
	coreDirectory: string;
}): string | undefined {
	const { userPath, coreDirectory } = options;
	if (userPath) {
		return resolveUserPath(userPath);
	}

	const candidates = [
		join(FRAMEWORK_PACKAGE_ROOT, "dist", coreDirectory),
		join(FRAMEWORK_PACKAGE_ROOT, "lib", coreDirectory),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return undefined;
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

	// Bot owner check
	if (permission === PermissionLevel.BOT_OWNER && client._options.botOwnerIds)
		return user
			? client._options.botOwnerIds.includes(user.id)
			: member
				? client._options.botOwnerIds.includes(member.id)
				: false;

	// Outside of a guild
	if (user) return true;

	// Inside a guild
	if (member) {
		const memberPermission = getPermissionLevel(client, member);
		return memberPermission >= permission;
	}

	return false;
}

export async function hashCommands(commands: RESTPostAPIApplicationCommandsJSONBody[]) {
	const json = JSON.stringify(commands.sort((a, b) => a.name.localeCompare(b.name)));

	const encoder = new TextEncoder();
	const data = encoder.encode(json);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);

	return Buffer.from(hashBuffer).toString("hex");
}
