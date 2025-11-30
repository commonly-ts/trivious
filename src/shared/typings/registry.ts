import { Collection } from "discord.js";
import { pathToFileURL } from "url";

export abstract class BaseRegistry<T> {
	protected abstract items: Collection<string, T>;
	protected abstract load(directory: string): Promise<this>;

	get() {
		return this.items;
	}

	protected async importFile<T>(filePath: string): Promise<T | null> {
		try {
			const { default: file } = await import(pathToFileURL(filePath).href);
			const imports = file.default ?? file;

			if (!imports) return null;

			if (typeof imports === "function" && imports.prototype) {
				return new imports();
			}

			if (typeof imports === "object") {
				return imports as T;
			}

			console.error(`Invalid export in ${filePath}: expected class or object`);
			return null;
		} catch (error: any) {
			console.error("Failed to import:", filePath, error);
			return null;
		}
	}

	protected async clearCache(filePath: string) {
		if (process.env.NODE_ENV === "production") return;
		try {
			const resvoled = require.resolve(filePath);
			delete require.cache[resvoled];
		} catch { }
	}
}
