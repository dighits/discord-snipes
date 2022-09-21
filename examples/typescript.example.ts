import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import { CacheManager, SnipesManager } from '../src/index';

class ExampleClient extends Client {
	public snipes = new SnipesManager(this, {
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
