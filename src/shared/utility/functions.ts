import { promises as fs, existsSync } from "fs";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const FRAMEWORK_ROOT = dirname(__dirname).endsWith("dist")
	? dirname(dirname(__dirname))
	: dirname(__dirname);

export function resolveUserPath(relativePath: string): string {
	const candidates = [
		join(process.cwd(), relativePath),
		join(process.cwd(), relativePath, 'src'),
		join(process.cwd(), relativePath.replace('src', 'lib')),
		join(process.cwd(), relativePath.replace('src', 'dist')),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) return candidate;
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
