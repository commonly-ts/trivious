import {
	ComponentCustomIdTag,
	ComponentType,
	CustomIdConstructOptions,
} from "../typings/components.js";

/**
 * Deconstruct a component customId into its parts.
 *
 * @param {string} customId
 * @returns {CustomIdConstructOptions}
 */
export const deconstructCustomId = (customId: string) => {
	const [componentType, dataTags] = customId.split(":") as [ComponentType, string];
	const [data, ...tags] = dataTags.split(".") as [string, ...ComponentCustomIdTag[]];

	return {
		compType: componentType,
		data,
		tags,
	} as CustomIdConstructOptions;
};

/**
 * Construct a component customId.
 *
 * @param {CustomIdConstructOptions} options
 * @returns {string}
 */
export const constructCustomId = (options: CustomIdConstructOptions) => {
	const { data, compType, tags } = options;
	return `${compType}:${data}${tags ? `.${tags.join(".")}` : ""}`;
};
