import { fileURLToPath } from "url";
import { dirname } from "path";

declare const _filename: string | undefined;
declare const _dirname: string | undefined;

export const __filename =
	typeof _filename === "string" ? _filename : fileURLToPath(import.meta.url);

export const __dirname = typeof _dirname === "string" ? _dirname : dirname(__filename);
