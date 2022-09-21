const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const { SnipesManager } = require('../src/index');

const client = new Client({ intents: [GatewayIntentBits.GuildMessages] });

// NOT RECOMMENDED | To avoid the constant use of import/require use the example of /javascript.advanced.js
const snipes = new SnipesManager(client, {
	properties: ['content', 'embeds', 'attachments', 'author'],
});

client.snipes = new SnipesManager(client); // NOT RECOMMENDED | This way you will lose all types, use the example of /javascript.advanced.js

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
