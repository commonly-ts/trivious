import { BaseCommandData, SlashCommandData } from "#feature/commands/commands.types.js";

export class TriviousError extends Error {
	readonly field?: string;
	readonly cause?: string;

	constructor(message: string, cause?: string) {
		message = `[Trivious] ${message}`;
		super(message);

		this.message = message;
		this.cause = cause;
		this.name = "TriviousError";
	}
}

export class CommandError extends Error {
	readonly commandName?: string;

	constructor(message: string, command: Partial<BaseCommandData | SlashCommandData>) {
		message = `[Trivious] ${message}`;
		super(message);

		this.name = "CommandError";

		if ("data" in command) this.commandName = command.data?.name;
		// if (this.commandContext && this.commandName)
		// 	this.cause = `Error in ${this.commandContext} '${this.commandName}'`;
	}
}
