import { ComponentContext, ComponentCustomId, ComponentTag } from "@typings";
import { TriviousError } from "@utility/errors.js";

const customId = {
	/**
	 * Decode a customId into its parts
	 */
	decode: (customId: string) => {
		const [context, identifier, info] = customId.split(":") as [
			ComponentContext,
			string,
			string | undefined,
		];
		const [data, ...tags] = info
			? (info.split(".") as [string | undefined, ...ComponentTag[]])
			: [undefined, undefined];

		return {
			context,
			identifier,
			data,
			tags,
		} as ComponentCustomId;
	},
	/**
	 * Encode a customId
	 */
	encode: (options: ComponentCustomId) => {
		const { context, identifier, data, tags } = options;
		let customId = `${context}:${identifier}`;

		if (data) customId += `:${data}`;
		if (tags) customId += `.${tags.join(".")}`;

		if (customId.length > 100) throw new TriviousError("Encoded customId exceeds 100 characters.");
		return customId;
	},
} as const;

export default customId;
