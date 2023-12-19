const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let unitProfiles = require('../unitprofiles.json');

const path = require("path");
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('view all your units')
		.addUserOption(option =>
			option.setName('target')
			.setDescription('the member whose list to check')
			.setRequired(false)),
	async execute(interaction) {
		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))
		target = interaction.options.getUser('target');
		const targetid = target ? target.id : interaction.member.id;

		if (stats[targetid] == null || Object.keys(stats[targetid]["units"]).length == 0)	await interaction.reply({ content: target ? (target.username + "doesn't have any units") : "you don't have any units"});
		else {


			let resultEmbed = new EmbedBuilder().setTitle(`${target ? target.username+"'s" : "your"} units (${stats[targetid]["totalpulled"]} total):`).setFooter({text: `balance: ${stats[targetid]["crystals"]} crystals`});
			let maxRarity = 0;

			let unitsByRarity = {
				"3stars":[],
				"4stars":[],
				"5stars":[],
				"6stars":[],
				"3starstotal": 0,
				"4starstotal": 0,
				"5starstotal": 0,
				"6starstotal": 0,
			}

			for (unit of Object.keys(stats[targetid]["units"])){

				if (unitProfiles[unit].rarity > maxRarity) {
					maxRarity = unitProfiles[unit].rarity ;
					resultEmbed.setColor([0xeeeeee, 0x92bcce, 0x84cc57, 0xf9bd22][unitProfiles[unit].rarity -3]);
				}

				unitsByRarity[unitProfiles[unit].rarity + "stars"].push( unitProfiles[unit].title + ((stats[targetid]["units"][unit] > 1) ? (" `x"+ stats[targetid]["units"][unit]) + '`' : ""));
				unitsByRarity[unitProfiles[unit].rarity + "starstotal"] += stats[targetid]["units"][unit];
			};

			for (i=3; i<=6; i++){
				if (unitsByRarity[i+"stars"].length > 0) resultEmbed.addFields({
					name:  `${i}★ (${unitsByRarity[i+"stars"].length} types, ${unitsByRarity[i+"starstotal"]} total):`,
					value: unitsByRarity[i+"stars"].join(", ")
				});
			};

			await interaction.reply({ embeds:[resultEmbed]});

		}
	},
};
