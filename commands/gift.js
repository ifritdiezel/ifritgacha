const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gift')
		.setDescription('gift 10 crystals to another user')
		.addUserOption(option =>
			option.setName('target')
			.setDescription('the member to gift 10 crystals to')
			.setRequired(true)),
	async execute(interaction) {

		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))

		let user = interaction.member.id;
		const target = interaction.options.getUser('target');

		if (stats[user] == null) stats[user]={"crystals":50, "units":{}, "lastdaily":0, "lastgifted":0};
		if (stats[target.id] == null) stats[target.id]={"crystals":50, "units":{}, "lastdaily":0, "lastgifted":0};

		if (stats[user]["lastgifted"] == null) stats[user]["lastgifted"] = 0;

		if (target.id == user) {
			await interaction.reply({ content: `you can't gift yourself`});
			return;
		}
		if (target.bot) {
			await interaction.reply({ content: `booo. gift someone who can use the crystals`});
			return;
		}
		if (target.id == "534750346309009428") {
			await interaction.reply({ content: `nuh uh. got heaps of the stuff`});
			return;
		}


		if (+new Date - stats[user]["lastgifted"] < 22 * 60 * 60 * 1000) {
			await interaction.reply({ content: `you already gifted today, you can gift again on <t:${Math.floor((stats[user]["lastgifted"] + 22 * 60 * 60 * 1000)/1000)}:f>`});
			return;
		}


		stats[target.id]["crystals"] += 10;
		stats[user]["lastgifted"] = +new Date;

		var newData = JSON.stringify(stats);
		fs.writeFileSync('stats.json', newData, err => {
			if(err) throw err;
		});


		await interaction.reply({ content: `gifted 10 crystals to ${target}!`});

	},
};
