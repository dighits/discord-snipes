import { Client, ChannelType, Partials, ClientOptions } from 'discord.js';
import { SnipesManager } from '.';
import 'dotenv/config';
import { CacheManager } from './CacheManager';

class MyClass extends Client {
	public snipes = new SnipesManager(this, {
		properties: ['content', 'attachments'],
		cache: new CacheManager({ expires: 3.6e3 }),
	});

	constructor(options: ClientOptions) {
		super(options);
	}
}

const client = new MyClass({ intents: ['Guilds', 'GuildMessages', 'MessageContent'], partials: [Partials.Message] });

client.on('ready', () => {
	console.log(`Bot logged as ${client.user?.tag} (${client.user?.id})`);
});

client.on('messageCreate', (message) => {
	console.log('a');
	if (message.channel.type === ChannelType.DM || message.author.bot || !message.content.startsWith('!!')) return;
	const args = message.content.slice('!!'.length).trim().split(/ +/g);
	const command = args?.shift()?.toLowerCase();

	if (command === 'snipe') {
		const channel = message.mentions.channels.first() || message.guild!.channels.cache.get(args[0]) || message.channel;
		const sniped = client.snipes.deletedMessages.get(channel.id);
		console.log({
			deleted: client.snipes.deletedMessages,
			updated: client.snipes.updatedMessages,
			bulks: client.snipes.bulkDeletedMessages,
		});
		message.reply({ content: sniped?.content });
	}
});

client.login();
