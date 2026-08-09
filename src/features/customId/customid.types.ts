import { ComponentContext } from "#typings";

export type ComponentTag = "awaited";
export interface ComponentCustomId {
	identifier: string;
	context: ComponentContext;
	data?: string;
	tags?: ComponentTag[];
}
