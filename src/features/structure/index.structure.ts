import { Collection } from "discord.js";
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

type ClientStores = "commands" | "components" | "events"| "modules";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const structure = {
	getPackageRoot() {
		let dir = __dirname;

		while (dir !== dirname(dir)) {
			if (existsSync(join(dir, "package.json")) || existsSync(join(dir, "node_modules"))) {
				return dir;
			}

			dir = dirname(dir);
		}

		return __dirname;
	},

	resolveRelativePath(relativePath: string) {
		const workingDir = process.cwd();
		const packageRoot = this.getPackageRoot();

		const candidates = [
			join(workingDir, "lib", relativePath),
			join(workingDir, "dist", relativePath),
			join(packageRoot, "lib", relativePath),
			join(packageRoot, "dist", relativePath),

			join(packageRoot, relativePath),
			join(workingDir, relativePath),
		];

		for (const candidate of candidates) {
			const full = resolve(candidate);
			if (existsSync(full)) return full;
		}

		return join(workingDir, relativePath);
	},

	resolveTypeBasedStructure(corePath: string) {
		const resolved = new Collection<ClientStores, string>();
		const directoriesToCheck: ClientStores[] = ["commands", "components", "events", "modules"];

		for (const dir of directoriesToCheck) {
			const fullPath = structure.resolveRelativePath(join(corePath, dir));
			if (!existsSync(fullPath)) continue;
			resolved.set(dir, fullPath);
		}

		return resolved;
	},
};

export default structure;
