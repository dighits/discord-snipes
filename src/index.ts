import { Collection, Client, Snowflake } from 'discord.js';
import { CacheManager } from './CacheManager';
import {
	DefaultOptions,
	DiscordSnipesOptions,
	SnipePropierties,
	SnipeEventEmitter,
	Snipe,
	CacheManagerOptions,
	ClearOptions,
} from './utils';

/**
 *  This is a {@link SnipesManager}, a utility to easily track and save in cache deleted and updated messages.
 *
 * @example JavaScript example
 * ```javascript
 * const { Client, GatewayIntentBits } = require('discord.js');
 * const { SnipesManager } = require('discord-snipes');
 *
 * class MyClient extends Client {
 * 		snipes = new SnipesManager(this);
 * }
 *
 * const client = new MyClient({ intents: [GatewayIntentBits.GuildMessages] });
 *
 * client.on('interactionCreate', (interaction) => {
 * 		if(interaction.isChatInputCommand() && interaction.commandName === 'snipe') {
 * 			const sniped = client.snipes.deletedMessages.get(interaction.channelId);
 * 			return interaction.reply({ content: sniped ? sniped.content : 'No snipes in this channel.' });
 * 		}
 * });
 * ```
 *
 * @example TypeScript example
 * ```typescript
 * import { Client, GatewayIntentBits } from 'discord.js';
 * import { SnipesManager } from 'discord-snipes';
 *
 * class MyClient extends Client {
 * 		public snipes = new SnipesManager(this);
 * }
 *
 * const client = new MyClient({ intents: [GatewayIntentBits.GuildMessages] });
 *
 * client.on('interactionCreate', (interaction) => {
 * 		if(interaction.isChatInputCommand() && interaction.commandName === 'snipe') {
 * 			const sniped = client.snipes.deletedMessages.get(interaction.channelId);
 * 			return interaction.reply({ content: sniped ? sniped.content : 'No snipes in this channel.' });
 * 		}
 * });
 * ```
 *
 * @example Advanced JavaScript example
 * ```javascript
 * const { Client, GatewayIntentBits } = require('discord.js');
 * const { SnipesManager, CacheManager } = require('discord-snipes');
 *
 * class MyClient extends Client {
 * 		snipes = new SnipesManager(this, {
 * 			properties: ['content', 'author', 'attachments'],
 * 			emitters: ['messageDelete'],
 * 			cache: new CacheManager({ expires: 3.6e6 })
 * 		});
 * }
 *
 * const client = new MyClient({ intents: [GatewayIntentBits.GuildMessages] });
 *
 * client.on('interactionCreate', (interaction) => {
 * 		if(interaction.isChatInputCommand() && interaction.commandName === 'snipe') {
 * 			const sniped = client.snipes.deletedMessages.get(interaction.channelId);
 * 			console.log(sniped.author) // -> User
 * 			console.log(sniped.embeds); // -> "undefined" because it is not in the array of property "properties" of this instance of SnipesManager.
 * 			return interaction.reply({ content: sniped ? sniped.content : 'No snipes in this channel.' });
 * 		}
 * });
 * ```
 */
export class SnipesManager<Props extends SnipePropierties, SnipeMessage = Snipe<Props>> {
	/**
	 * The {@linkplain Client Discord Client}.
	 *
	 * @example ```javascript
	 * const { Client, GatewayIntentBits } = require('discord.js');
	 * const client = new Client({ intents: [GatewayIntentBits.GuildMessages] });
	 * ```
	 *
	 * @public
	 * @readonly
	 */
	public readonly client: Client;

	/**
	 * The cached deleted messages collection.
	 *
	 * @default ```javascript
	 * new Collection()
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly deletedMessages: Collection<Snowflake, SnipeMessage>;

	/**
	 * The cached updated messages collection.
	 *
	 * @default ```javascript
	 * new Collection()
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly updatedMessages: Collection<Snowflake, SnipeMessage>;

	/**
	 * The cached bulk deleted messages collection.
	 *
	 * @default ```javascript
	 * new Collection()
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly bulkDeletedMessages: Collection<Snowflake, Collection<Snowflake, SnipeMessage>>;

	/**
	 * The {@linkplain SnipeEventEmitter emitters} of events that will be executed.
	 *
	 * @example ```javascript
	 * ['messageUpdate', 'messageDeleteBulk']
	 * ```
	 *
	 * @default ```javascript
	 * ['messageDelete', 'messageUpdate']
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly emitters: SnipeEventEmitter[];

	/**
	 * Whether partials of saved messages should be fetched.
	 *
	 * @default ```javascript
	 * false
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly fetchPartials: boolean;

	/**
	 * The properties of the messages that will be saved in the cache.
	 *
	 * @example ```javascript
	 * ['content', 'attachments', 'embeds']
	 * ```
	 * @default ```javascript
	 * []
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly properties: SnipePropierties;

	/**
	 * Handles when to delete cache data.
	 *
	 * @example ```javascript
	 * new CacheManager({ expires: 3.6e3, clear: { enabled: true, interval: 3.6e6 } });
	 * ```
	 * @default ```javascript
	 * new CacheManager({ enabled: false })
	 * ```
	 * @public
	 * @readonly
	 */
	public readonly cache: CacheManager<SnipeMessage>;

	/**
	 * Constructor of the {@link SnipesManager} class.
	 *
	 * @param  {Client} client The {@linkplain Client Discord Client}.
	 * @param  {DiscordSnipesOptions<Props>} options? The {@link DiscordSnipesOptions} for this instance of the {@link SnipesManager} class.
	 */
	constructor(client: Client, options?: DiscordSnipesOptions<Props>) {
		this.client = client;
		this.deletedMessages = new Collection();
		this.updatedMessages = new Collection();
		this.bulkDeletedMessages = new Collection();
		this.emitters = options?.emitters ?? DefaultOptions.Emitters;
		this.fetchPartials = options?.fetchPartials ?? DefaultOptions.Partials;
		this.properties = options?.properties ?? [];
		this.cache = (options?.cache as CacheManager<SnipeMessage>) ?? new CacheManager({ enabled: false });

		this.deleteEventExecute();
		this.updateEventExecute();
		this.bulkEventExecute();

		const { clear } = this.cache;

		if (clear && clear.enabled) setInterval(() => this.clearAll(), clear.interval ?? 3.6e6);
	}

	/**
	 * Clear all the cached messages of all collections.
	 *
	 * @returns {void} void
	 * @public
	 */
	public clearAll() {
		const size = this.bulkDeletedMessages.size + this.deletedMessages.size + this.updatedMessages.size;
		this.cache.logger && this.cache.log('Clearing all collections...');
		this.bulkDeletedMessages.clear();
		this.deletedMessages.clear();
		this.updatedMessages.clear();
		this.cache.logger && this.cache.log(`Cleared ${size} collections.`);
	}

	private deleteEventExecute() {
		const { emitters, client, properties, cache, fetchPartials } = this;

		if (emitters.includes('messageDelete')) {
			client.on('messageDelete', async (message) => {
				if (fetchPartials) if (message.partial) message = await message.fetch();
				const snipeMessage = {};
				properties.forEach((prop) => Object.assign(snipeMessage, { [prop]: message[prop] }));
				this.deletedMessages.set(message.channelId, snipeMessage as SnipeMessage);
				cache.inspect(message.channelId, this.deletedMessages);
			});
		}
	}

	private updateEventExecute() {
		const { emitters, client, properties, cache, fetchPartials } = this;

		if (emitters.includes('messageUpdate')) {
			client.on('messageUpdate', async (message) => {
				if (fetchPartials) if (message.partial) message = await message.fetch();
				const snipeMessage = {};
				properties.forEach((prop) => Object.assign(snipeMessage, { [prop]: message[prop] }));
				this.updatedMessages.set(message.channelId, snipeMessage as SnipeMessage);
				cache.inspect(message.channelId, this.updatedMessages);
			});
		}
	}

	private bulkEventExecute() {
		const { emitters, client, properties, cache, fetchPartials } = this;

		if (emitters.includes('messageDeleteBulk')) {
			client.on('messageDeleteBulk', async (messages, channel) => {
				const bulkMessages = new Collection();
				for await (let [id, message] of messages.entries()) {
					if (fetchPartials) message = await message.fetch();
					const snipeMessage = {};
					properties.forEach((prop) => Object.assign(snipeMessage, { [prop]: message[prop] }));
					bulkMessages.set(id, snipeMessage);
				}
				this.bulkDeletedMessages.set(channel.id, bulkMessages as Collection<string, SnipeMessage>);
				cache.inspect(channel.id, this.bulkDeletedMessages);
			});
		}
	}
}

export {
	DefaultOptions,
	DiscordSnipesOptions,
	SnipePropierties,
	SnipeEventEmitter,
	CacheManager,
	CacheManagerOptions,
	ClearOptions,
};

export default SnipesManager;
