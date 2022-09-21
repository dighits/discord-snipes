import type { Collection, Snowflake } from 'discord.js';
import type { CacheManagerOptions, ClearOptions } from './utils';

export class CacheManager<SnipeMessage> {
	public readonly enabled?: boolean | null;
	public readonly expires?: number | null;
	public readonly clear?: ClearOptions | null;
	public readonly logger: boolean;

	constructor(options: CacheManagerOptions) {
		this.enabled = options.enabled ?? true;
		this.expires = options.expires ?? null;
		this.clear = options.clear ?? null;
		this.logger = options.logger ?? false;
	}
	/**
	 * @param  {Snowflake} id The id of the channel.
	 * @param  {Collection<Snowflake, SnipeMessage | Collection<Snowflake, SnipeMessage>>} collection The collection to be inspected.
	 *
	 * @returns {void} void
	 * @public
	 */
	public inspect(id: Snowflake, collection: Collection<Snowflake, SnipeMessage | Collection<Snowflake, SnipeMessage>>) {
		if (!this.expires || !this.enabled) return;
		setTimeout(() => {
			collection.delete(id);
			this.log(`The collection of the channel ${id} has been deleted of the cache.`);
		}, this.expires);
	}
	/**
	 * @param  {string} message The message that will be logged.
	 *
	 * @returns {false | void} false | void
	 * @public
	 */
	public log(message: string) {
		return this.logger && console.log(`[DISCORD_SNIPES] :: ${message}`);
	}
}
