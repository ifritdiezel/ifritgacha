const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require("path");
let units = require('../units.json');
let unitProfiles = require('../unitprofiles.json');
const config = require('../config.json');

module.exports = {
	data:  new SlashCommandBuilder()
		.setName('multipull')
		.setDescription('pull 5 new units for 25 crystals'),

	async execute(interaction) {
		let user = interaction.member.id;
		let count = 5; //how many times to pull

		let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../stats.json"), 'utf8', function (err, data) {
			if (err) {
				return;
			};
		}))


		if (stats[user] == null) stats[user]={"crystals":50, "units":{}};
		if (stats[user]["crystals"] < count * 5){
			await interaction.reply({ content: "you don't have enough crystals for this"});
			return;
		}
		stats[user]["crystals"] -= count * 5;


		let resultEmbed = new EmbedBuilder().setTitle(`pulled ${count} units:`).setFooter({text: `balance: ${stats[user]["crystals"]} crystals`});
		let maxRarity = 0;
		let hasLimited = false;

		for ( let i = 0; i < count; i++){
			let rng = Math.floor(Math.random() * (200));
			if (i == count -1) rng = Math.max(0, rng - 5);
			let rarity = 3;
			if (rng < 2) rarity = 6;
			else if (rng < 16) rarity = 5;
			else if (rng < 60) rarity = 4;


			if (stats[user]["totalpulled"]) stats[user]["totalpulled"] += 1;
			else stats[user]["totalpulled"] = 1;

			if (stats[user]["nohighraritystreak"] == null) stats[user]["nohighraritystreak"] = 0;

			//pity system
			if (stats[user]["totalpulled"] % 80 == 0) rarity = Math.min(6, rarity + 2);
			else if (stats[user]["nohighraritystreak"] >= 60) rarity = Math.min(6, rarity + 2);

			if (user == config.ownerId) rarity = 3;

			if (rarity < 5) {
			 if (stats[user]["nohighraritystreak"]) stats[user]["nohighraritystreak"] += 1;
			 else stats[user]["nohighraritystreak"] = 1;
			}

			if (rarity > 4){
				if (stats[user]["highrarityunits"]) stats[user]["highrarityunits"] += 1;
				else stats[user]["highrarityunits"] = 1;
				stats[user]["nohighraritystreak"] = 0;
			}

			rarityid = rarity + "star";

			if (rarity > maxRarity && !hasLimited) {
				maxRarity = rarity;
				resultEmbed.setColor([0xeeeeee, 0x92bcce, 0x84cc57, 0xf9bd22][rarity-3]);
			}


			unit = units[rarityid][Math.floor((Math.random()*units[rarityid].length))];

			if(units[rarityid+"limited"] && units[rarityid+"limited"].length > 0 && Math.floor(Math.random() * (4)) == 0) {
				unit = units[rarityid+"limited"][Math.floor((Math.random()*units[rarityid+"limited"].length))];
				hasLimited = true;
				resultEmbed.setColor((rarity == 5) ? 0x8c44ea : 0xd1a4f2);
			}

			console.log("pulled", unit);

			if (stats[user]["units"][unit]) stats[user]["units"][unit] += 1;
			else stats[user]["units"][unit] = 1;
			resultEmbed.addFields({name: unitProfiles[unit].title + " ("+rarity+"★)"+ (stats[user]["units"][unit] == 1 ? " NEW!":""), value: unitProfiles[unit].desc})

		}

			await interaction.reply({ embeds:[resultEmbed
			]});

			var newData = JSON.stringify(stats);
			fs.writeFileSync('stats.json', newData, err => {
				if(err) throw err;
			});
		}

	};
