import { promises as fs } from "fs";
import { pathToFileURL } from "url";

export async function importFile<T>(filePath: string): Promise<T | null> {
	try {
		const { default: file } = await import(pathToFileURL(filePath).href);
		if (!file) return null;

		const imports = file.default || file;

		if (typeof imports === "function" && imports.prototype) {
			return new imports() as T;
		}

		if (typeof imports == "object") {
			if (Object.keys(imports).length === 0) return null;
			return imports as T;
		}

		return null;
	} catch (err: any) {
		console.warn(`[Trivious] Error while importing file ${filePath}`, err);
		return null;
	}
}

export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}
