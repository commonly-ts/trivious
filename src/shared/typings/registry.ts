import { Collection } from "discord.js";

export abstract class BaseRegistry<T> {
	protected abstract items: Collection<string, T>;
	protected abstract load(directory: string): Promise<this>;

	get() {
		return this.items;
	}

	protected async clearCache(filePath: string) {
		if (process.env.NODE_ENV === "production") return;
		try {
			const resvoled = require.resolve(filePath);
			delete require.cache[resvoled];
		} catch {}
	}
}
