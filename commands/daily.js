const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('claim 30 free crystals every day'),
	async execute(interaction) {

		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))

		let user = interaction.member.id;

		if (stats[user] == null) stats[user]={"crystals":50, "units":{}, "lastdaily":0};
		if (stats[user]["lastdaily"] == null) stats[user]["lastdaily"] = 0;
		if (+new Date - stats[user]["lastdaily"] < 22 * 60 * 60 * 1000) {
			await interaction.reply({ content: `you already claimed today, you can claim again on <t:${Math.floor((stats[user]["lastdaily"] + 22 * 60 * 60 * 1000)/1000)}:f>`});
			return;
		}

		stats[user]["crystals"] += 30;
		stats[user]["lastdaily"] = +new Date;

		var newData = JSON.stringify(stats);
		fs.writeFileSync('stats.json', newData, err => {
			if(err) throw err;
		});


		await interaction.reply({ content: `claimed 30 crystals, balance: ${stats[user]["crystals"]} crystals. ${+new Date - stats[user]["lastgifted"] > 22 * 60 * 60 * 1000 ? "your /gift is ready too" : ""}`});

	},
};
