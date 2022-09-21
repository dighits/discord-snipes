const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const { CacheManager, SnipesManager } = require('../src/index');

/*
	You must first extend the discord.js Client class,
	this will serve to have the types available and will give you greater comfort.

	Use: <Client>.snipes.deletedMessages.get(id)
*/
class ExampleClient extends Client {
	snipes = new SnipesManager(this, {
		emitters: ['messageDelete'],
		properties: ['content', 'embeds', 'attachments', 'author'],
		cache: new CacheManager({ expires: 3.6e3, clear: { enabled: true, interval: 3.6e6 } }),
	});
}

const client = new ExampleClient({ intents: [GatewayIntentBits.GuildMessages] });

client.on('interactionCreate', (interaction) => {
	if (interaction.isChatInputCommand() && interaction.commandName === 'snipe') {
		const sniped = client.snipes.deletedMessages.get(interaction.channelId);

		if (sniped) {
			const embed = new EmbedBuilder().setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL() });

			if (sniped.content) embed.setDescription(sniped.content);

			const url = sniped.attachments.first()?.proxyURL;
			if (url) embed.setImage(url);

			if (sniped.embeds?.length) embed.addFields({ name: 'Embeds', value: sniped.embeds.length.toString(), inline: true });

			if (sniped.attachments.size)
				embed.addFields({ name: 'Attachments', value: sniped.attachments.size.toString(), inline: true });

			interaction.reply({ embeds: [embed] });
		}
	}
});
