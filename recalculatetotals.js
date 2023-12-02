//a script to recalculate user stats


let unitProfiles = require('./unitprofiles.json');

const path = require("path");
const fs = require('fs');

let stats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./stats.json"), 'utf8', function (err, data) {
	if (err) {
		return;
	};
}))
for (player of Object.keys(stats)){
	let curusertotalpulled = 0;
	let curusertotalrare = 0;
	for (unit of Object.keys(stats[player]["units"])){
		curusertotalpulled += stats[player]["units"][unit];
		if (unitProfiles[unit].rarity > 4) curusertotalrare += stats[player]["units"][unit];
	};
	stats[player].totalpulled = curusertotalpulled;
	stats[player].highrarityunits = curusertotalrare;
	console.log(player, curusertotalpulled, curusertotalrare)
};
var newData = JSON.stringify(stats);
fs.writeFile('stats.json', newData, err => {
	if(err) throw err;
});
