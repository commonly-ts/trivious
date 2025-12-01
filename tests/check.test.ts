import { TriviousClient } from "src/index.ts";
import { describe, expect, it } from "vitest";

const mockClient = new TriviousClient({
	clientIdReference: "CLIENT_ID", tokenReference: "BOT_TOKEN",
	intents: [],
	corePath: "core"
});

describe("EventRegistry", () => {
	it("preset commands", () => {
		mockClient.registries.events.load();
		expect(mockClient.registries.events.get().size).toBe(2);
	})
});