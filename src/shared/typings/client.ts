import { ClientOptions } from "discord.js";

export interface TriviousClientOptions extends ClientOptions {
	tokenReference: string;
	clientIdReference: string;

	// Core paths
	commandsPath?: string;
	componentsPath?: string;
	eventsPath?: string;
	modulesPath?: string;
}
