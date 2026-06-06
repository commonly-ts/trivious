import { Module } from "@typings";

export default {
	name: "testModule",
	events: {
		applicationCommandPermissionsUpdate: async () => {},
	},
} satisfies Module;
