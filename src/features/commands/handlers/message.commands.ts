import { MessageCommandArgumentType, MessageCommandData, TriviousClient } from "#typings";
import { Guild } from "discord.js";
import { formatUsage } from "../utility.js";

const argumentRegex: Record<MessageCommandArgumentType, RegExp> = {
	"duration": /\d+[smhdwy]/,
	"text": /.+?/,
	"snowflake": /<[@#&]!?\d{17,19}>|\d{17,19}/,
	"snowflake/channel": /<#\d{17,19}>|\d{17,19}/,
	"snowflake/role": /<@&\d{17,19}>|\d{17,19}/,
	"snowflake/user": /<@!?\d{17,19}>|\d{17,19}/,
	"timestamp": /\d{10}/,
	"date": /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{2,4}\/\d{1,2}\/\d{1,2}/,
	"number": /[+-]?\d+\.\d*?|\.\d+/,
};

export function processPartialMessageCommand(
	client: TriviousClient,
	command: MessageCommandData
): MessageCommandData<true> {
	let pattern = `^${command.name}`;
	if (command.arguments) {
		for (const argument of command.arguments) {
			const { dataType } = argument;
			let required = argument.required;
			if (required === undefined) {
				command.arguments.find((arg) => arg.name === argument.name)!.required = true;
				required = true;
			}
			const source = argumentRegex[dataType].source;
			if (!source) continue;
			pattern += required ? `\\s+(${source})` : `(?:\\s+(${source}))?`;
		}
	}
	pattern += "$";
	command.metadata = {
		regex: new RegExp(pattern),
		usage: formatUsage(client.trivious.messageCommands?.prefix ?? "?", command),
	};
	return command;
}

function parseNumber(value: string): number | null {
	if (value.trim() === "") return null;
	const num = Number(value);
	return !Number.isNaN(num) ? num : null;
}

const durationUnitMap: Record<string, number> = {
	s: 1,
	m: 60,
	h: 60 * 60,
	d: 60 * 60 * 24,
	w: 60 * 60 * 24 * 7,
	y: 60 * 60 * 24 * 7 * 365,
};
const snowflakeDataMap: Record<string, [RegExp, "channels" | "roles" | "users"]> = {
	"snowflake/channel": [/(?:<#)?(\d{17,19})>?/, "channels"],
	"snowflake/role": [/(?:<@&)?(\d{17,19})>?/, "roles"],
	"snowflake/user": [/(?:<@!?)?(\d{17,19})>?/, "users"],
};
type ParseArgumentResult<T> = [result: T] | [result: null, reason: string];
export function parseMessageCommandArgument<T = string | number | Date>(
	dataType: MessageCommandArgumentType,
	value: string,
	context: { name: string; client: TriviousClient; guild: Guild | null },
	regex?: RegExp
): ParseArgumentResult<T> {
	switch (dataType) {
		case "duration": {
			const result = value.match(regex || /(\d+)([smhdwy])/);
			if (!result) return [null, "Invalid input."];
			const [, num, unit] = result;
			const unitMultiplier = durationUnitMap[unit];
			const [number, reason] = parseMessageCommandArgument<number>("number", num, context);
			if (!number) return [null, reason!];
			return [Math.ceil(number * unitMultiplier * 1000) as T];
		}
		case "number": {
			const number = parseNumber(value);
			if (!number) return [null, "Invalid number."];
			return [number as T];
		}
		case "snowflake/channel":
		case "snowflake/role":
		case "snowflake/user": {
			const { client, guild } = context;
			const [regex, manager] = snowflakeDataMap[dataType];
			const [id] = parseMessageCommandArgument<string>("snowflake", value, context, regex);
			const singular = manager.slice(0, manager.length - 1);
			if (!id) return [null, `Cannot fetch ${singular}: invalid.`];
			const clientTarget =
				client && manager in client ? (client as Record<string, any>)[manager] : null;
			const guildTarget =
				guild && manager in guild ? (guild as Record<string, any>)[manager] : null;
			const object = guildTarget?.cache?.get(id) ?? clientTarget?.cache?.get(id) ?? null;
			if (!object) return [null, `Cannot fetch ${singular}: undefined.`];
			return [object as T];
		}
		case "snowflake": {
			let isSnowflake = parseNumber(value);
			if (isSnowflake) return [value as T];
			const result = value.match(regex || /(?:<[@#&]!?)?(\d{17,19})>?/);
			if (!result) return [null, "Invalid input"];
			const id = result[1];
			isSnowflake = parseNumber(id);
			if (!isSnowflake) return [null, "Invalid snowflake or mention."];
			return [id as T];
		}
		case "text":
			return [String(value) as T];
		case "date":
		case "timestamp": {
			const date = new Date(value);
			if (Number.isNaN(+date)) return [null, "Invalid timestamp or date passed."];
			return [date as T];
		}
		default:
			return [null, "Nothing to parse"];
	}
}
