import { Collection } from "discord.js";
import { pathToFileURL } from "url";

/**
 * Base registry for loading, getting and binding core events and functions.
 *
 * @export
 * @abstract
 * @class BaseRegistry
 * @typedef {BaseRegistry}
 * @template T
 */
export abstract class BaseRegistry<T> {
	protected abstract items: Collection<string, T>;
	/**
	 * Load all of T
	 *
	 * @protected
	 * @abstract
	 * @param {string} directory
	 * @returns {Promise<this>}
	 */
	protected abstract load(directory: string): Promise<this>;

	/**
	 * Get all of loaded T
	 *
	 * @returns {Collection<string, T>}
	 */
	get() {
		return this.items;
	}

	/**
	 * Import a file from a path to be loaded.
	 *
	 * @protected
	 * @async
	 * @template T
	 * @param {string} filePath
	 * @returns {Promise<T | null>}
	 */
	protected async importFile<T>(filePath: string): Promise<T | null> {
		try {
			const { default: file } = await import(pathToFileURL(filePath).href);
			const imports = file.default ?? file;

			if (!imports) return null;

			if (typeof imports === "function" && imports.prototype) {
				return new imports();
			}

			if (typeof imports === "object") {
				if (Object.keys(imports).length === 0) return null;
				return imports as T;
			}

			console.error(`Invalid export in ${filePath}: expected class or object`);
			return null;
		} catch (error: any) {
			console.error("Failed to import:", filePath, error);
			return null;
		}
	}

	/**
	 * Clear file path cache.
	 * Does not run in production environment.
	 *
	 * @protected
	 * @async
	 * @param {string} filePath
	 * @returns {*}
	 */
	protected async clearCache(filePath: string) {
		if (process.env.NODE_ENV === "production") return;
		try {
			const resvoled = require.resolve(filePath);
			delete require.cache[resvoled];
		} catch { }
	}
}
