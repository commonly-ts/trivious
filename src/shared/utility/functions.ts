import { promises as fs, existsSync } from "fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getPermissionLevel, PermissionLevel } from "../typings/permissions.js";
import { GuildMember, User } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export const FRAMEWORK_PACKAGE_ROOT = getPackageRoot();

export function getCorePath(options: { userPath?: string; coreDirectory: string }): string {
	const { userPath, coreDirectory } = options;
	if (userPath) {
		return resolveUserPath(userPath);
	}

	const builtInCandidates = [
		join(FRAMEWORK_PACKAGE_ROOT, "lib", coreDirectory),
		join(FRAMEWORK_PACKAGE_ROOT, "dist", coreDirectory),
		// join(FRAMEWORK_PACKAGE_ROOT, "src", coreDirectory),
	];

	for (const candidate of builtInCandidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return join(FRAMEWORK_PACKAGE_ROOT, "lib", coreDirectory);
}

export function resolveUserPath(relativePath: string): string {
	const candidates = [
		join(process.cwd(), relativePath),

		// join(process.cwd(), "src", relativePath),
		join(process.cwd(), "lib", relativePath),
		join(process.cwd(), "dist", relativePath),

		join(FRAMEWORK_PACKAGE_ROOT, relativePath),
		// join(FRAMEWORK_PACKAGE_ROOT, "src", relativePath),
		join(FRAMEWORK_PACKAGE_ROOT, "lib", relativePath),
		join(FRAMEWORK_PACKAGE_ROOT, "dist", relativePath),
	];

	for (const candidate of candidates) {
		const full = resolve(candidate);
		if (existsSync(full)) return full;
	}

	return join(process.cwd(), relativePath);
}

export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

export function hasPermission(options: {
	permission: PermissionLevel;
	user?: User;
	member?: GuildMember;
}) {
	const { permission, user, member } = options;

	if (user) {
		if (permission === PermissionLevel.BOT_OWNER) {
			return !(user.id === "424764032667484171");
		}
		return true;
	}

	if (member) {
		const memberPermission = getPermissionLevel(member);
		return permission > memberPermission;
	}

	return false;
}
