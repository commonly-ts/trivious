import { Collection } from "discord.js";
import { pathToFileURL } from "node:url";

export abstract class BaseRegistry<T> {
	protected abstract items: Collection<string, T>;
	protected abstract load(directory: string): Promise<this>;

	get() {
		return this.items;
	}

	protected async importFile(filePath: string): Promise<T | null> {
		try {
			this.clearCache(filePath);

			const { default: imported } = (await import(pathToFileURL(filePath).href)) as { default: T };
			return imported;
		} catch (error: any) {
			console.error(`Failed to load at ${filePath}:`, error?.message ?? error);
			return null;
		}
	}

	protected async clearCache(filePath: string) {
		if (process.env.NODE_ENV === "production") return;
		try {
			const resvoled = require.resolve(filePath);
			delete require.cache[resvoled];
		} catch {}
	}
}
