const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('admin only')
		.addUserOption(option =>
			option.setName('target')
			.setDescription('the member to add to')
			.setRequired(true))
		.addIntegerOption(option =>
			option.setName('amount')
			.setDescription('how much to give')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('for')
			.setDescription('why give')
			.setRequired(true))
		,
	async execute(interaction) {
		if (interaction.member.id != config.ownerId){
			await interaction.reply({ content: "this is admin only", ephemeral: true });
			return;
		}
		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))

		const target = interaction.options.getUser('target');
		const amount = interaction.options.getInteger('amount') ?? 1;
		const reason = interaction.options.getString('for') ?? "nothing";
		const all = target.id == config.clientId;

		let finalresponse;

		if (all) {
			for (player of Object.keys(stats)){
				if (stats[player] == null) stats[player]={"crystals":50, "units":{}};
				stats[player]["crystals"] += amount;
			}
			finalresponse = `gave ${amount} crystals to everyone **${reason}**`
		} else {
			if (stats[target.id] == null) stats[target.id]={"crystals":50, "units":{}};
			stats[target.id]["crystals"] += amount;
			finalresponse = `gave ${amount} crystals to ${target.username} for a total of ${stats[target.id]["crystals"]} for **${reason}**`;
		}
		var newData = JSON.stringify(stats);
		fs.writeFile('stats.json', newData, err => {
			if(err) throw err;
		});


		await interaction.reply({ content: finalresponse});

	},
};
