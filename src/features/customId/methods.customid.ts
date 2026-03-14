import type { ComponentContext, ComponentCustomId, ComponentTag } from "#typings";
import { TriviousError } from "#utility/errors.js";

/**
 * Decode a customId into its parts
 * @param customId The custom id
 * @returns Decoded customId
 */
export const decodeCustomId = (customId: string) => {
	const [context, identifier, info] = customId.split(":") as [
		ComponentContext,
		string,
		string | undefined,
	];
	const [data, ...tags] = info?.split(".") as [string | undefined, ...ComponentTag[]];

	return {
		context,
		identifier,
		data,
		tags,
	} as ComponentCustomId;
};

/**
 * Encode a customId
 * @param options Custom id parts
 * @returns Encoded customId
 * @throws {TriviousError} If encoded length exceeds 100 characters
 */
export const encodeCustomId = (options: ComponentCustomId) => {
	const { context, identifier, data, tags } = options;
	let customId = `${context}:${identifier}`;

	if (data) customId += `:${data}`;
	if (tags) customId += `.${tags.join(".")}`;

	if (customId.length > 100) throw new TriviousError("Encoded customId exceeds 100 characters.");
	return customId;
};
