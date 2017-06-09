const fs = require('fs');
const bot = require('../bot.js');
const path = require('path');
const knex = require('knex')(require('../knexfile.js').development);

// function addUser (msg) {
// 	console.log("Adduser fired.");
// 	knex('user_data').insert({
// 		"user_id":   msg.author.id,
// 		"username":  msg.author.username,
// 		"server_id": msg.guild.id,
// 		"xp":        0,
// 		"last_msg":  new Date()
// 	})
// 	.then(
// 		() => {
// 			console.log(`${bot.timestamp()} New user ${msg.author.username} added.`)
// 		})
// 	.catch(
// 		(reason) => {
// 			console.log(`${bot.timestamp()} Error adding new user to table.`, reason);
// 		});
// }

//input level integer, output base xp amount
function xpCost(n) {
	return 25*(3*n+2)*(n-1);
}

//input xp amount, return level
function quadratic(y){
	let a = 75;
	let b = -25;
	let c = -50 - y;
	return Math.floor((-(b)+(Math.pow((Math.pow(b,2)- 4*a*c),0.5))) / (2*a));
}

//returns amount of XP remainder over lvl
function diff(xp) {
	return xp - xpCost(quadratic(xp));
}

//Retrieve info based on your character
var info = function (msg) {
	knex.select('*').from('user_data').where({
		'user_id': msg.author.id,
		'server_id': msg.guild.id
	}).then((rows) =>{
		if (rows.length > 0) {
			let entry = rows[0];
			let xp = entry.message_xp + entry.quest_xp;
			let level = quadratic(xp);
			msg.channel.sendMessage(`${msg.member}: **Level ${level}** - **${diff(xp)}/${xpCost(level+1) - xpCost(level)} XP**`);
		}  else {
			msg.channel.sendMessage(`${msg.member}: **Level 0** - **0/${xpCost(2)} XP**`);
			addUser(msg.author.id, msg.guild.id);
		}
	}).catch((reason) =>{
		console.log(`Error pulling user data for !level`, reason);
	})
}

//Give small amount of XP every amount of time
var msgXp = function (msg,minutes,amount) {
	knex.select('*').from('user_data').where({
		'user_id': msg.author.id,
		'server_id': msg.guild.id
	})
	.then(
		(rows) => {
			if (rows.length>0) {
				let entry = rows[0];
				if ((new Date() - new Date(entry.last_msg)) > (60000*minutes)) {
					let xp = entry.message_xp + entry.quest_xp;
					let newXp = xp + amount;

					if (quadratic(xp) < quadratic(newXp)) {
						msg.channel.sendMessage(`${msg.author} increased to **Level ${quadratic(newXp)}!**`);
						console.log(`${bot.timestamp()} ${msg.member.nickname} grew to level ${quadratic(newXp)}`);
					}
					knex('user_data').where('id',entry.id).update({
						message_xp: entry.message_xp+amount, 
						last_msg: new Date()
					})
					.then(() =>{
					})
					.catch((reason) => {
						console.log(reason);
					});
				}  else return;
			}  else  {
				console.log("User not found");
				addUser(msg.author.id,msg.guild.id);
			}
		})
	.catch(
		(reason) => {
			console.log(`Error fetching user data.`,reason);
		})
}

// !level add @Mcnamara 400
var giveXp = function (msg, argument) {
	let target = msg.mentions.users.first();
	if (target) {
		knex('user_data').select('*').where({
			'user_id':   target.id,
			'server_id': msg.guild.id
		})
		.then(
			function(rows) {
				if (rows.length > 0) {
					let entry = rows[0];
					let tempArr = msg.content.trim().split(" ");
					let xpAmount = parseInt(tempArr[tempArr.length-1]);
					let oldTotalXp = entry.quest_xp + entry.message_xp;
					let newQuestXp = entry.quest_xp + xpAmount;
					let newTotalXp = newQuestXp+entry.message_xp;


					if (quadratic(oldTotalXp) < quadratic(newTotalXp)) {
						msg.channel.sendMessage(`${target} increased to **Level ${quadratic(newTotalXp)}!**`);
						console.log(`${bot.timestamp()} ${msg.guild.member(target).nickname} grew to level ${quadratic(newTotalXp)}`);
					}

					knex('user_data').where('id', entry.id).update({
						quest_xp: newQuestXp
					}).then(() =>{
						msg.channel.sendMessage(`${xpAmount}xp given to ${msg.mentions.users.first().username}`).then((msg) =>{
							setTimeout(() =>{
								msg.delete();
							}, 3000);
						})
					});

				}  else msg.channel.sendMessage("User data not found.");

			})
		.catch(
			function(reason) {
				console.log(`Error querying database`,reason);
			})
	}
}

function existsUser(user){

}

const lookUpID = (msg, argument) => {
	knex.select('*').from('user_data').where({
		'user_id':argument,
		'server_id': msg.guild.id
	}).then((rows) => {
		if (rows.length > 0) {
			let target = bot.users.get(entry.user_id)
			let entry = rows[0];
			let xp = entry.quest_xp + entry.message_xp;
			let level = quadratic(xp);
			msg.channel.sendMessage(`${target.username}\n**Level ${level}** - **${diff(xp)}/${xpCost(level+1) - xpCost(level)} XP**\nMessage XP: ${entry.message_xp}\nQuest XP: ${entry.quest_xp}`);
		}  else {
			msg.channel.sendMessage("User not found.")
		}
	}).catch((err) =>{
		console.log(err);
	})
}

const addUser = (user_id, server_id/*, username*/) => {
	//user_id,server_id,username
	console.log("Adding user ",user_id)
	knex.select('id').from('user_data').where({'user_id':user_id,'server_id': server_id})
	.then((rows) => {
		if (rows.length<1) {
			knex('user_data').insert({
			"user_id":   		user_id,
			//"username":  username,
			"server_id": 		server_id,
			"quest_xp": 		0,
			"message_xp":  		0,
			"last_msg":  		new Date()
			}).then(() => {
				console.log("User Added")
				return true;
			});
		}  else {
			console.log("Failed to forceadd " + user_id);
			return false;
		}
	})
};



module.exports = function(bot,knex)  {
	return {
		get:info,
		give:giveXp,
		msgXp:msgXp,
		addUser:addUser,
		lookUpID: lookUpID
	}
}
