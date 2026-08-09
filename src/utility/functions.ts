import { promises as fs } from "fs";
import path from "path";
import { pathToFileURL } from "url";

const fileCache = new Map<string, Promise<any | null>>();
export function importFile<T>(filePath: string): Promise<T | null> | null {
	if (filePath.endsWith(".d.ts") || filePath.endsWith(".js.map")) return null;
	const absolutePath = path.resolve(filePath);
	if (fileCache.has(absolutePath)) return fileCache.get(absolutePath)!;

	const processPromise = (async () => {
		try {
			const { default: file } = await import(pathToFileURL(absolutePath).href);
			if (!file) return null;

			const imports = file.default || file;
			if (typeof imports === "function" && imports.prototype) return new imports() as T;
			if (typeof imports === "object" && imports !== null) {
				if (Object.keys(imports).length === 0) return null;
				return imports as T;
			}

			return null;
		} catch (err: any) {
			console.warn(`[Trivious] Error while import file ${filePath}`, err);
			return null;
		}
	})();

	fileCache.set(absolutePath, processPromise);
	processPromise.then((result) => {
		if (result === null) fileCache.delete(absolutePath);
	});
	return processPromise;
}

export function clearFileImportsCache() {
	fileCache.clear();
}

export async function exists(path: string) {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}
