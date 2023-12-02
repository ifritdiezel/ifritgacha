const { SlashCommandBuilder } = require('discord.js');

const path = require("path");
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('check how many crystals you got')
		.addUserOption(option =>
			option.setName('target')
			.setDescription('the member to check balance for')
			.setRequired(false)),
	async execute(interaction) {
		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))
		const target = interaction.options.getUser('target') ?? interaction.member;
		if (stats[target.id] == null) stats[target.id]={"crystals":50, "units":{}, "lastdaily":0};
		await interaction.reply({ content: `${interaction.options.getUser('target') ? (target.username + "'s" ) : "your"} balance is ${stats[target.id]["crystals"]} crystals`});
	},
};
