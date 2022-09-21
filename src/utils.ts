import type { Collection, Message, Snowflake } from 'discord.js';
import type { CacheManager } from './CacheManager';

export type SnipeEventEmitter = 'messageDelete' | 'messageUpdate' | 'messageDeleteBulk';
export type SnipePropierties = (keyof Omit<Message, 'valueOf' | 'toString'>)[];
export type Snipe<Props extends SnipePropierties> = { [key in Props[number]]: Message[key] };
export type InspectCollection<SnipeMessage> = Collection<Snowflake, SnipeMessage | Collection<Snowflake, SnipeMessage>>;

const DEFAULT_EMITTERS: SnipeEventEmitter[] = ['messageDelete', 'messageUpdate'];
const DEFAULT_PROPERTIES: SnipePropierties = ['content', 'embeds', 'author', 'attachments'];

export const DefaultOptions = {
	Emitters: DEFAULT_EMITTERS,
	Partials: false,
	Properties: DEFAULT_PROPERTIES,
};

export interface SnipesManagerOptions<Props> {
	emitters?: SnipeEventEmitter[];
	fetchPartials?: boolean;
	properties?: Props;
	cache?: CacheManager<Snipe<SnipePropierties>>;
}

export interface CacheManagerOptions {
	enabled?: boolean | null;
	expires?: number | null;
	clear?: ClearOptions | null;
	logger?: boolean;
}

export interface ClearOptions {
	enabled?: true;
	interval?: number;
}
