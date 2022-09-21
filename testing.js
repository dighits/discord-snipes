const { Client, Partials, ChannelType } = require('discord.js');
const { SnipesManager } = require('./dist/index');
require('dotenv/config');

class MyClient extends Client {
	snipes = new SnipesManager(this, {
		emitters: ['messageDelete', 'messageUpdate'],
		properties: ['content'],
		cache: {
			expires: 30_000,
			clearAll: {
				enabled: true,
				interval: 15_000,
			},
			logger: true,
		},
	});
}

const client = new MyClient({ intents: ['Guilds', 'GuildMessages', 'MessageContent'], partials: [Partials.Message] });

client.on('ready', () => {
	console.log(`Bot logged as ${client.user?.tag} (${client.user?.id})`);
});

client.on('messageCreate', (message) => {
	if (message.channel.type === ChannelType.DM || message.author.bot || !message.content.startsWith('!!')) return;
	const args = message.content.slice('!!'.length).trim().split(/ +/g);
	const command = args?.shift()?.toLowerCase();

	if (command === 'snipe') {
		const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
		const sniped = client.snipes.deletedMessages.get(channel.id);
		message.reply({ content: sniped ? sniped.content : 'No hay ningún mensaje borrado recientemente' });
	}
});

client.login();
