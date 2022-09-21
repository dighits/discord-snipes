# Discord Snipes — Track and cache deleted and updated messages.

Discord Snipes is a [Node.js](https://node.js.org/) module that allows you to easily track and cache deleted and updated messages!

## Installation

```bash
npm install discord-snipes
```

```bash
yarn add discord-snipes
```

## Setup

```js
const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const { CacheManager, SnipesManager } = require('discord-snipes');

class MyClient extends Client {
	snipes = new SnipesManager(this, {
		// None of these properties are required, they all have default values.

		// The emitters of events that will be executed.
		emitters: ['messageDelete'],

		// The properties of the messages that will be saved in the cache.
		properties: ['content', 'embeds', 'author', 'attachments'],

		/* Handles when to delete cache data.
		expires: Time in which a collection is deleted after being established.
		clear: Handles an auto-clear of the entire cache with a custom time interval. */
		cache: new CacheManager({ expires: 3.6e3, clear: { enabled: true, interval: 3.6e6 } }),
	});
}

// The GuildMessages intent is required for the events used to execute.
const client = new MyClient({ intents: [GatewayIntentBits.GuildMessages] });
```

## Usage

```js
client.on('interactionCreate', (interaction) => {
	if (interaction.isChatInputCommand() && interaction.commandName === 'snipe') {
		// Get the last message deleted from a channel.
		const sniped = client.snipes.deletedMessages.get(interaction.channelId);

		if (sniped) {
			// If there is a deleted message found in the cache, we will send an embed with information about it.

			// You will only be able to access the configured properties.

			const embed = new EmbedBuilder().setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL() });

			if (sniped.content) embed.setDescription(sniped.content);

			const url = sniped.attachments.first()?.proxyURL;
			if (url) embed.setImage(url);

			if (sniped.embeds?.length) embed.addFields({ name: 'Embeds', value: sniped.embeds.length.toString(), inline: true });

			if (sniped.attachments.size)
				embed.addFields({ name: 'Attachments', value: sniped.attachments.size.toString(), inline: true });

			interaction.reply({ embeds: [embed] });
		} else interaction.reply({ content: 'No recently deleted messages found.' });
	}
});
```

## SnipesManager

### SnipesManager — Options

| Property          | Type                                                                    | Optional | Default                                          |
| ----------------- | ----------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| **cache**         | [CacheManager](https://github.com/notbojji/discord-snipes#cachemanager) | yes      | `new CacheManager({ enabled: false })`           |
| **emitters**      | [SnipeEventEmitter](https://github.com/notbojji/discord-snipes#types)[] | yes      | `['messageDelete', 'messageUpdate']`             |
| **fetchPartials** | `boolean`                                                               | yes      | `false`                                          |
| **properties**    | [SnipeProperties](https://github.com/notbojji/discord-snipes#types)     | yes      | `['content', 'embeds', 'author', 'attachments']` |

### SnipesManager — Methods

| Method       | Description                                       | Parameters | Returns |
| ------------ | ------------------------------------------------- | ---------- | ------- |
| **clearAll** | Clear all the cached messages of all collections. | none       | `void`  |

## CacheManager

### CacheManager — Options

| Property    | Type                                                                             | Optional | Default |
| ----------- | -------------------------------------------------------------------------------- | -------- | ------- |
| **clear**   | [ClearOptions](https://github.com/notbojji/discord-snipes#options--clearoptions) | yes      | `null`  |
| **enabled** | `boolean`                                                                        | yes      | `true`  |
| **expires** | `number`                                                                         | yes      | `null`  |
| **logger**  | `boolean`                                                                        | yes      | `false` |

### Options — ClearOptions

| Property     | Type      | Optional | Default     |
| ------------ | --------- | -------- | ----------- |
| **enabled**  | `boolean` | yes      | `undefined` |
| **interval** | `number`  | yes      | `3.6e6`     |

### CacheManager — Methods

| Method      | Description           | Parameters                                                                                                                                                                | Returns |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **inspect** | Inspect a collection. | `id`: [Snowflake](https://discord.js.org/#/docs/discord.js/main/typedef/Snowflake)<br>`collection`: [InspectCollection](https://github.com/notbojji/discord-snipes#types) | `void`  |

## Types

| Name                  | Type                                                                                                                                                                                                                                                                                                                                                 | Generic |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **InspectCollection** | [Collection](https://discord.js.org/#/docs/collection/main/class/Collection)<[Snowflake](https://discord.js.org/#/docs/discord.js/main/typedef/Snowflake), SnipeMessage \| [Collection](https://discord.js.org/#/docs/collection/main/class/Collection)<[Snowflake](https://discord.js.org/#/docs/discord.js/main/typedef/Snowflake), SnipeMessage>> | yes     |
| **SnipeEventEmitter** | 'messageDelete' \| 'messageUpdate' \| 'messageDeleteBulk'                                                                                                                                                                                                                                                                                            | no      |
| **SnipePropierties**  | (keyof Omit<[Message](https://discord.js.org/#/docs/discord.js/main/class/Message), 'valueOf' \| 'toString'>)[]                                                                                                                                                                                                                                      | no      |
| **Snipe**             | { [key in Props[number]]: [Message](https://discord.js.org/#/docs/discord.js/main/class/Message)[key] }                                                                                                                                                                                                                                              | yes     |
