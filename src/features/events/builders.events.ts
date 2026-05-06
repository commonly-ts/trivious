import { Event } from "#typings";

/**
 * Create an event handler
 * @param data Event data
 * @returns Event
 */
export function createEvent(data: Event): Event {
	return data;
}

/**
 * Create an event handler that runs once
 * @param data Event data
 * @returns Event
 */
export function createOnceEvent(data: Omit<Event, "once">): Event {
	return {
		once: true,
		...data,
	} satisfies Event;
}
