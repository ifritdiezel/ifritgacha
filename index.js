const fs = require('node:fs');
const path = require('node:path');
const unitProfiles = require('./unitprofiles.json')
const config = require("./config.json");

if (!(config.token && config.clientId && config.guildId && config.ownerId)){
	console.log("you have to fill out all config fields first");
	process.exit();
}

let unitGroups = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./units.json"), 'utf8', function (err, data) {
	if (err) {
		unitGroups = {}
	};
}))

for (i = 3; i <= 6; i++){
	unitGroups[i+"star"] = [];
}

for (unit of Object.keys(unitProfiles)) {
	if (!unitProfiles[unit]["limited"]) unitGroups[unitProfiles[unit].rarity + "star"].push(unit);
}

var newData = JSON.stringify(unitGroups, null, 2);
fs.writeFileSync('units.json', newData, err => {
	if(err) throw err;
});


const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Ready!');
	workingchannel = client.channels.cache.get('1071308340124200963');
  //workingchannel.send('');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(config.token);
