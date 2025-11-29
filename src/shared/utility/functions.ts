import { promises as fs } from "fs";

export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}
