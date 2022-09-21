import type { Collection, Snowflake } from 'discord.js';
import type { CacheManagerOptions, ClearOptions } from './utils';

export class CacheManager<SnipeMessage> {
	/**
	 * State of the Cache Manager.
	 *
	 * @example ```javascript
	 * false
	 * ```
	 * @default ```javascript
	 * true
	 * ```
	 * @type {boolean | undefined | null}
	 * @public
	 * @readonly
	 */
	public readonly enabled?: boolean | null;

	/**
	 * Time in which a collection is deleted after being established.
	 *
	 * @example ```javascript
	 * 3.6e3
	 * ```
	 * @default ```javascript
	 * null
	 * ```
	 * @type {number | undefined | null}
	 * @public
	 * @readonly
	 */
	public readonly expires?: number | null;

	/**
	 * Handles an auto-clear of the entire cache with a custom time interval.
	 *
	 * @example ```javascript
	 * { enabled: true, interval: 3.6e6 }
	 * ```
	 * @default ```javascript
	 * null
	 * ```
	 * @type {ClearOptions | undefined | null}
	 * @public
	 * @readonly
	 */
	public readonly clear?: ClearOptions | null;

	/**
	 * Logs in the console when clearing data from the cache.
	 *
	 * @example ```javascript
	 * true
	 * ```
	 * @default ```javascript
	 * false
	 * ```
	 * @type {number}
	 * @public
	 * @readonly
	 */
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
