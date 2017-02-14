const fs = require('fs');
const bot = require('../bot.js');
const path = require('path');
const knex = require('knex')(require('../knexfile.js').development);

function addUser (msg) {
	console.log("Adduser fired.");
	knex('user_data').insert({
		"user_id":   msg.author.id,
		"username":  msg.author.username,
		"server_id": msg.guild.id,
		"xp":        0,
		"last_msg":  new Date()
	})
	.then(
		() => {
			console.log(`${bot.timestamp()} New user ${msg.author.username} added.`)
		})
	.catch(
		(reason) => {
			console.log(`${bot.timestamp()} Error adding new user to table.`, reason);
		});
}

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
	}).then((rows)=>{
		if (rows.length > 0) {
			let entry = rows[0];
			let xp = entry.xp;
			let level = quadratic(xp);
			msg.channel.sendMessage(`${msg.member}: **Level ${level}** - **${diff(xp)}/${xpCost(level+1) - xpCost(level)} XP**`);
		}  else {
			addUser(msg);
		}
	}).catch((reason)=>{
		console.log(`Error pulling user data for !level`, reason);
	})
}

//Give small amount of XP every amount of time
var msgXp = function (msg,minutes,amount) {
	console.log(`Giving msg Xp to ${msg.author}`)
	knex.select('*').from('user_data').where({
		'user_id': msg.author.id,
		'server_id': msg.guild.id
	})
	.then(
		(rows) => {
			console.log(rows.length);
			if (rows.length>0) {
				let entry = rows[0];
				if ((new Date() - new Date(entry.last_msg)) > (60000*minutes)) {
					let newXp = entry.xp + amount;

					if (quadratic(entry.xp) < quadratic(newXp)) {
						msg.channel.sendMessage(`${msg.author} increased to **Level ${quadratic(newXp)}!**`);
						console.log(`${bot.timestamp()} ${msg.member.nickname} grew to level ${quadratic(newXp)}`);
					}
					knex('user_data').where('id',entry.id).update({
						xp: newXp, 
						last_msg: new Date()
					}).then().catch((reason)=> {
						console.log(reason);
					});
				} else return;
			}  else addUser(msg);
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
					let newXp = entry.xp + xpAmount;

					if (quadratic(entry.xp) < quadratic(newXp)) {
						msg.channel.sendMessage(`${target} increased to **Level ${quadratic(newXp)}!**`);
						console.log(`${bot.timestamp()} ${msg.guild.member(target).nickname} grew to level ${quadratic(newXp)}`);
					}

					knex('user_data').where('id', entry.id).update({
						xp: entry.xp+xpAmount
					}).then(()=>{
						msg.channel.sendMessage(`${xpAmount}xp given to ${msg.mentions.users.first().username}`).then((msg)=>{
							setTimeout(()=>{
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
	knex.select('xp').from('user_data').where({
		'user_id':argument,
		'server_id': msg.guild.id
	}).then((rows)=> {
		if (rows.length > 0) {
			let entry = rows[0];
			let xp = entry.xp;
			let level = quadratic(xp);
			msg.channel.sendMessage(`**Level ${level}** - **${diff(xp)}/${xpCost(level+1) - xpCost(level)} XP**`);
		}else {
			msg.channel.sendMessage("User not found.")
		}
	}).catch((err)=>{
		console.log(err);
	})
}

const forceAdd = (user_id,server_id,username)=> {
	knex.select('id').from('user_data').where({'user_id':user_id,'server_id': server_id})
	.then((rows)=> {
		console.log(rows);
		if (rows.length<1) {
			knex('user_data').insert({
			"user_id":   user_id,
			"username":  username,
			"server_id": server_id,
			"xp":        0,
			"last_msg":  new Date()
			}).then(()=> {
				console.log("User Added")
				return true;
			});
		} else {
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
		lookUpID: lookUpID,
		forceAdd: forceAdd
	}
}