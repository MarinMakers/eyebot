const fs = require('fs');
const bot = require('../bot.js');
const path = require('path');
try {
	const xpFile = JSON.parse(fs.readFileSync(path.join(__dirname,'../db/xp.json')));
} catch(e) {
	process.stdout.write('User XP file not found. Making a blank one now.\n')
	fs.writeFileSync(path.join(__dirname,"../db/xp.json"),`{"users":[]}`);
	let xpFile = JSON.parse(fs.readFileSync(path.join(__dirname,"../db/xp.json")));
	// let ticker = setInterval(function(){process.stdout.write(".")},1000);
	let guilds = bot.guilds.array();
	for (i in guilds) {
		let members = guilds[i].members.array();
		//tasti O(n^2)
		for (j in members) {
			let pushData = {
				"id":members[j].user.id,
				"username": members[j].user.username,
				"xp":0
			}
			xpFile.users.push(pushData);
		}
	}
	remember(xpFile);
}

function addUser (msg,xpFile) {
	msg.channel.sendMessage("Not Found... Adding your character.").then(()=> {
		let pushData = {
			"id":msg.author.id,
			"username": msg.author.username,
			"xp":0
		}
		xpFile.users.push(pushData);
		remember(xpFile);
		console.log(`[${new Date()}] - Added user ${pushData.username}`);
	})
}

//input level integer, output base xp amout
function xpCost(n) {
	return 25*(3*n+2)*(n-1);
}

//input xp amout, return level
function quadratic(y){
	let a = 75;
	let b = -25;
	let c = -50 - y;
	return Math.floor((-(b)+(Math.pow((Math.pow(b,2)- 4*a*c),0.5))) / (2*a));
}

//returns amount of XP over lvl
function diff(xp) {
	return xp - xpCost(quadratic(xp));
}

//Retrieve info based on your character
var info = function (msg) {
	let xpFile = JSON.parse(fs.readFileSync(path.join(__dirname,'../db/xp.json')))
	for (i in xpFile.users) {
		if (xpFile.users[i].id === msg.author.id) {
			console.log(xpFile.users[i]);
			let xp = xpFile.users[i].xp;
			let level = quadratic(xp);
			msg.channel.sendMessage(`${msg.member}: **Level ${level}** - **${diff(xp)}/${xpCost(level+1) - xpCost(level)} XP**`);
			return;
		}
	}
	addUser(msg,xpFile);
	return console.log("Not found.")
}
// !level add @Mcnamara 400
var giveXp = function (msg, argument) {
	let target = msg.mentions.users.first();
	let xpFile = JSON.parse(fs.readFileSync(path.join(__dirname,'../db/xp.json')))
	for (i in xpFile.users) {
		if (xpFile.users[i].id === target.id) {
			let tempArr = msg.content.trim().split(" ");
			let xpAmount = parseInt(tempArr[tempArr.length-1]);
			let newXp= xpFile.users[i].xp+xpAmount;
			if (quadratic(xpFile.users[i].xp) < quadratic(newXp)) {
				msg.channel.sendMessage(`${msg.author} increased to **Level ${quadratic(newXp)}!**`);
			}
			xpFile.users[i].xp = newXp;
			console.log(`[${new Date()}] - ${msg.member.nickname} gave ${target.username} ${xpAmount}xp`);
			remember(xpFile);
			return;
		}
	}
	addUser(msg,xpFile);
	return console.log("Not found.")
}

function remember(file) {
	fs.writeFileSync(path.join(__dirname,"../db/xp.json"),JSON.stringify(file));
}


module.exports = function(bot)  {
	return {
		get:info,
		give:giveXp
	}
}