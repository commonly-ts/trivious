import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const FRAMEWORK_ROOT = dirname(__dirname).endsWith("dist")
	? dirname(dirname(__dirname))
	: dirname(__dirname);

export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}
