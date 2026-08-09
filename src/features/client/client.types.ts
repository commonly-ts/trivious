import { ClientOptions } from "discord.js";

/**
 * Login credentials for the Discord application
 *
 * @param token Environment variable name for bot token
 * @param clientId Environment variable name for bot client ID
 */
export interface TriviousClientCredentials {
	tokenReference: string;
	clientIdReference: string;
}

/**
 * Base interface for project structure
 *
 * @param useTypeBasedStructure Whether to use type-based structure or not
 */
export interface TriviousStructure {
	useTypeBasedStructure: boolean;
}

/**
 * Type-based project structure configuration
 *
 * Everything is inside `src/core`; `src/core/commands`, `src/core/event`...
 *
 * Directory names of course can be different, but the default expected names are used unless configured otherwise by the user
 *
 * @param useTypeBasedStructure Identify as type-based structure
 * @param corePath The path to the **core** directory
 * @param commandsPath The path to the **commands** directory
 * @param componentsPath The path to the **components** directory
 * @param eventsPath The path to the **components** directory
 * @param modulesPath The path to the **module** directory
 */
export interface TypeBasedStructure extends TriviousStructure {
	useTypeBasedStructure: true;
	corePath: string;
	commandsPath?: string;
	componentPath?: string;
	eventsPath?: string;
	modulesPath?: string;
}

/**
 * Feature-based structure configuration
 *
 * Everything is inside `src/features`; `src/features/moderation` and further; `src/features/moderation/commands/ban/index.ts`
 *
 * Feature directories are expected to contain command, component, event, and module directories.
 * Though event and module directories remain optionally supported in the core path.
 *
 * @param useTypeBasedStructure Identify as feature-based structure
 * @param featuresPath The path to the **features** directory
 * @param corePath The path to the **core** directory - Commands and Components are NOT supported in this structure
 */
export interface FeatureBasedStructure extends TriviousStructure {
	useTypeBasedStructure: false;
	featuresPath: string;
	corePath?: string;
}

/**
 * Command hash configuration for automatic command deployment
 *
 * @param enabled Whether this feature is enabled
 * @param persistentDataPath The path to store the command hash, this should be persistent so the feature works as intended
 */
export interface CommandHashConfiguration {
	enabled: boolean;
	persistentDataPath: string;
}

/**
 * Message command configuration
 *
 * @param prefix Usually a single character (e.g. `?`, `!`, `.`) to identify message commands
 * @param delimiter Specific character(s) and/or symbol(s) to mark boundary of strings, mainly for use by `sentence` argument types
 */
export interface MessageCommandConfiguration {
	/**
	 * Recommended value(s): `?` `!` `.`
	 */
	prefix: string;
	/**
	 * Recommended value(s): `#` `|` `$`
	 */
	// delimiter?: string | string[];
}

/**
 * Trivious client options
 *
 * @param credentials Bot login credentials
 * @param structurePaths Chosen project structure and relevant paths
 * @param ownerUserIds Discord user IDs of bot owner(s)
 * @param commandHashConfig Command auto-deployment configuration
 */
export interface TriviousClientOptions extends ClientOptions {
	credentials: TriviousClientCredentials;
	corePath: string;
	ownerUserIds?: string[];
	commandHashConfig?: CommandHashConfiguration;
	debug?: boolean;
	messageCommands?: MessageCommandConfiguration;
}
