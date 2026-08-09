import { MessageCommandArgumentType, MessageCommandData, TriviousClient } from "#typings";

const argumentRegex: Record<MessageCommandArgumentType, RegExp> = {
	"duration": /\d+[smhdwy]/,
	"text": /.+?/,
	"snowflake": /<[@#&]?\d+>|\d+/,
	"snowflake/user": /<[@]?\d+>|\d+/,
	"snowflake/channel": /<[#]?\d+>|\d+/,
	"snowflake/role": /<[&]?\d+>|\d+/,
	"timestamp": /\d{10}/,
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
	command.regex = new RegExp(pattern);
	return command;
}
