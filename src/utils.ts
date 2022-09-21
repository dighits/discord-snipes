import type { Message } from 'discord.js';
import type { CacheManager } from './CacheManager';

export type SnipeEventEmitter = 'messageDelete' | 'messageUpdate' | 'messageDeleteBulk';
export type SnipePropierties = (keyof Omit<Message, 'valueOf' | 'toString'>)[];
export type Snipe<Props extends SnipePropierties> = { [key in Props[number]]: Message[key] };

const DEFAULT_EMITTERS: SnipeEventEmitter[] = ['messageDelete', 'messageUpdate'];

export const DefaultOptions = {
	Emitters: DEFAULT_EMITTERS,
	Partials: false,
};

export interface DiscordSnipesOptions<Props> {
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
