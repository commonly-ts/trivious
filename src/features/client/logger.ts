export class Logger {
	constructor(
		private prefix = "Trivious",
		private debugActive = false
	) {}

	debug(...args: any[]) {
		if (!this.debugActive) return;
		console.log(`[${this.prefix}] [DEBUG]`, ...args);
	}

	info(...args: any[]) {
		console.log(`[${this.prefix}]`, ...args);
	}

	warn(...args: any[]) {
		console.log(`[${this.prefix} [WARN]]`, ...args);
	}

	error(...args: any[]) {
		console.log(`[${this.prefix} [ERROR]]`, ...args);
	}
}
