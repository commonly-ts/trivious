import { Component, ComponentContext } from "#typings";

/**
 * Create component handler
 * @param data Component data
 * @returns Component
 */
export function createComponent<Context extends ComponentContext = ComponentContext>(
	data: Component<Context>
): Component<Context> {
	return data;
}

/**
 * Create a button component handler
 * @param data Component data
 * @returns Button Component
 */
export function createButtonComponent(
	data: Omit<Component<ComponentContext.Button>, "context" | "component">
): Component<ComponentContext.Button> {
	return {
		context: ComponentContext.Button,
		...data,
	};
}

/**
 * Create a select menu component handler
 * @param data Component data
 * @returns AnySelectMenu Component
 */
export function createSelectMenuComponent(
	data: Omit<Component<ComponentContext.SelectMenu>, "context" | "component">
): Component<ComponentContext.SelectMenu> {
	return {
		context: ComponentContext.SelectMenu,
		...data,
	};
}

/**
 * Create a modal component handler
 * @param data Component data
 * @returns Modal Component
 */
export function createModalComponent(
	data: Omit<Component<ComponentContext.Modal>, "context" | "component">
): Component<ComponentContext.Modal> {
	return {
		context: ComponentContext.Modal,
		...data,
	};
}
