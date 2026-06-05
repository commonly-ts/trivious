import chalk from "chalk";

export class Logger {
	constructor(
		private prefix = "Trivious",
		private debugActive = false
	) {}

	debug(...args: any[]) {
		if (!this.debugActive) return;
		console.log(chalk.gray(`[${this.prefix}] [DEBUG]`), ...args);
	}

	info(...args: any[]) {
		console.log(chalk.cyan([`${this.prefix}`]), ...args);
	}

	warn(...args: any[]) {
		console.log(chalk.yellow([`${this.prefix} [WARN]`]), ...args);
	}

	error(...args: any[]) {
		console.log(chalk.red([`${this.prefix} [ERROR]`]), ...args);
	}
}
