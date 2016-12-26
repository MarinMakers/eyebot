//This is the main script for the bot. To start the bot, run this script with node
const Discord = require("discord.js");
const discord_auth = require('./auth.json');

const bot = new Discord.Client();

const data = require('./db/data.json');
const prefix = data.prefix;

let queue = {};

const fs = require('fs');
const child_process = require('child_process');
const yt = require('ytdl-core');
const knex = require('knex')(require('./knexfile.js').development);

//Custom modules
const decider = require('./nifty/decisions.js')(bot); 
const gitHelper = require('./nifty/git.js')(bot);
const todo = require('./nifty/todo.js')(bot);
var level;

//bot methods
bot.checkRole = (msg, role) => {
	if (msg.guild.roles.find('name',role) != undefined) {
		let foundRole = msg.guild.roles.find('name',role);
		if (msg.member.roles.has(foundRole.id)){
			return true;
		} else {
			return false;
		}
	} else {
		console.log(`WARNING! Role not found: ${role}`);
		return false;
	}
}
bot.reject = (msg)=> {
	msg.channel.sendCode('diff','- Access Denied\nThis incident will be reported');
	console.log(`${bot.timestamp()} ${msg.member.nickname} tried to use the command ${msg.cleanContent}`)
}

bot.timestamp = (msg) => {
	return `[ ${new Date()} ] -`;
}

var getMethod = (argument) => {
	//Grab first word in a command
	if(argument.indexOf(' ') != -1){
		return argument.split(' ')[0];
	}else{
		return argument;
	}
}

var getParameter = (argument) => {
	return argument.substring(argument.indexOf(' ')+1, argument.length);
}

const commands = {
	'todo': {
		process: (msg, argument) => {
			// Get rid of this at some point
			var messageFunction = (msg) => {
				msg.channel.sendMessage(msg);
			}

			var method = getMethod(argument);
			
			if (method === "add"){
				var taskToAdd = getParameter(argument);
				todo.add(taskToAdd, msg);
			}  else if (method === "remove"){
				var ids = getParameter(argument);
				todo.remove(ids, msg);
			}  else if (method === "complete"){
				var id = getParameter(argument);
				todo.complete(id, msg);
				// complete tasks
			}  else if (method === "export") {
				todo.exportList(msg);
			}  else{
				todo.showTasks(msg);
			}
		},
		usage: "[add <string>] [remove <id>] [complete <id>]",
		description: "Interact with the bot's todo lists."
	},
	'ping': {
		process: (msg, argument) => {
			msg.channel.sendMessage(msg.author + " pong!");
			console.log(`${bot.timestamp()} ${msg.author.username} pinged the bot`);
		},
		description: "Check if the bot is online."
	},
	'pull': {
		process: (msg, argument) => {
			if (bot.checkRole(msg, 'dev')){
				gitHelper.pull((msg) => {
					msg.channel.sendMessage(msg);
				})
			}else{
				bot.reject(msg);
			}
		},
		description: "Pulls the bot's code from github on to the server. You must have the role 'developer' to use this functionality.",
		discrete:true
	},
	'help': {
		process: (msg, argument) => {
			let commandList = 'Available Commands:```'
			for (cmd in commands) {
				if (!commands[cmd].discrete) {
					let command = prefix + cmd;
					let usage = commands[cmd].usage;
					if (usage) {
						command += " " + usage;
					}
					let description = commands[cmd].description;
					if(description){
						command += "\n\t" + description;
					}
					commandList+=command+"\n";
				}
			}
			commandList += "```\n"+ data.musicPanel;
			msg.author.sendMessage(commandList)
		},
		description: "Messages user list of commands"
	},
	'roll': {
		process: (msg, argument) => {
			decider.rollDice(argument, (result) => {
				msg.channel.sendMessage(result)
			})
		},
		usage: "<d20 syntax>",
		description: "Roll dice using d20 syntax"
	},
	'say': {
		process: (msg, argument) => {
			msg.channel.sendMessage(argument);
		},
		usage: "<string>",
		description: "Make the bot say something"
	},
	'kill': {
		process: (msg, argument) => {
			if (bot.checkRole(msg, 'Elder') || bot.checkRole(msg, 'Head Scribe')) {
				msg.channel.sendMessage("*Beep boop, click*").then(()=> {
					console.log("Being shut down by " + msg.author.username);
					process.exit();
				});
			}  else {
				bot.reject(msg);
			}
		},
		description: "This kills the robot. Must have privileges to execute.",
		discrete: true
	},
	'task': {
		process: (msg, argument) => {
			commands["todo"].process(msg,argument)
		},
		description: "Alias for !todo"
	},
	'enlist': {
		process: (msg,argument) => {
			if (bot.checkRole(msg,"Elder")||bot.checkRole(msg,"Head Scribe")||bot.checkRole(msg,"Head Paladin")||bot.checkRole(msg,"Head Knight")) {
				if (msg.mentions.users.first() != undefined) {
					let target = msg.guild.member(msg.mentions.users.first());
					if (target.highestRole.name==="@everyone") {
						target.addRole(msg.guild.roles.find("name", "Initiate").id).then((value) => {
							target.setNickname(`Initiate ${target.user.username}`).then((value) => {
								target.sendMessage("Welcome, "+ target.nickname +data.welcomeMsg);
							}, (reason) => {
								console.log(reason);
							});
						}, (reason) => {
							console.log(reason);
						});
					}  else {
						msg.channel.sendMessage("Target is ineligible for recruitment.")
					}
				} else {
					msg.channel.sendMessage("Mention a user to enlist.")
				}
			} else {
				bot.reject(msg);
			}
		},
		description: "Join the Brotherhood of Steel."
	},
	'propaganda': {
		process: (msg,argument) => {
			fs.readdir('./assets/images', (err, files) => {
				if (err) {
					msg.channel.sendMessage("No assets found.");
				}  else {
					files = files.filter((file)=> {
						return file.substring(0,1) != '.';
					});
					msg.channel.sendFile('assets/images/'+ files[Math.floor(Math.random()*files.length)]);
					console.log("Propaganda posted.");
					return;
				}
			})
		},
		description: "Display a piece of BoS propaganda."
	},
	'info': {
		process: (msg,argument) => {
			msg.channel.sendMessage(data.credits);
		},
		description: "Credits for the bot."
	},
	'level': {
		process: (msg,argument)=>{
			if (msg.content.split(" ").length = 1) {
				level.get(msg);
			}
		},
		description: "View your level"
	},
	'xp': {
		process: (msg,argument)=> {
			if (bot.checkRole(msg,"Elder")||bot.checkRole(msg,"Head Scribe")||bot.checkRole(msg,"Head Paladin")||bot.checkRole(msg,"Head Knight")||bot.checkRole(msg,"Senior Scribe")) {
				console.log(msg.author);
				level.give(msg,argument);
			}  else bot.reject(msg);
		},
		description: "Give XP to a user. Need permissions.",
		usage: "@<username> <#>"
	},
	'xplu': {
		process: (msg,argument)=> {
			level.lookUpID(msg,argument);
		}
	},
	'update': {
		process: (msg,argument)=> {
			if (msg.author.id === "127060142935113728") {
				msg.channel.sendMessage("fetching updates...").then(function(sentMsg){
					console.log("updating...");
					var spawn = require('child_process').spawn;
					var log = function(err,stdout,stderr){
						if(stdout){console.log(stdout);}
						if(stderr){console.log(stderr);}
					};
					var fetch = spawn('git', ['fetch']);
					fetch.stdout.on('data',function(data){
						console.log(data.toString());
					});
					fetch.on("close",function(code){
						var reset = spawn('git', ['pull','origin/master']);
						reset.stdout.on('data',function(data){
							console.log(data.toString());
						});
						reset.on("close",function(code){
							var npm = spawn('npm', ['install']);
							npm.stdout.on('data',function(data){
								console.log(data.toString());
							});
							npm.on("close",function(code){
								console.log("goodbye");
								sentMsg.edit("brb!").then(function(){
									bot.destroy().then(function(){
										process.exit();
									});
								});
							});
						});
					});
				});
			}
		}
	},
	'revoke':{
		process: (msg)=>{
			if (msg.mentions.users.first() != undefined) {
				let target = msg.guild.member(msg.mentions.users.first());
				if (target.highestRole.name === 'Elder') {
					msg.author.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value)=>{
						msg.channel.sendMessage("_The bot fries your hand as you attempt this treasonous act, rendering you incapable of interacting with the bot any further_");
					})
				} else {
					if (bot.checkRole(msg,"Elder")||bot.checkRole(msg,"Head Scribe")||bot.checkRole(msg,"Head Paladin")||bot.checkRole(msg,"Head Knight")) {
						target.addRole(msg.guild.roles.find("name", "Blacklisted").id).then((value) => {
							msg.channel.sendMessage(`${target} has had their bot privileges revoked until further notice.`)
						}, (reason) => {
							console.log(reason);
						});
					} else {
						bot.reject(msg);
					}
				}
			} else {
				msg.channel.sendMessage("Mention a user to revoke.")
			}
		},
		usage:"<@target>",
		description: "Revoke bot privileges from target. Requires permissions."
	},
	'play': {
		process: (msg) => {
			if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with !add`);
			if (!msg.guild.voiceConnection) {
				return commands['join'].process(msg).then(() => {
					commands['play'].process(msg);
					return;
				});
			}
			if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
			let dispatcher;
			queue[msg.guild.id].playing = true;

			(function play(song) {
				console.log(song);
				if (song === undefined) {
					play({url:data.defaultSong});
					return;
				};
				if (!queue[msg.guild.id].looping && song.title != undefined){
					msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
				}
				dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : 1 });
				queue[msg.guild.id].songs.shift();
				let collector = msg.channel.createCollector(m => m);
				collector.on('message', m => {
					if (m.content.startsWith(prefix + 'pause')) {
						msg.channel.sendMessage('paused').then(() => {dispatcher.pause();});
					} else if (m.content.startsWith(prefix + 'resume')){
						msg.channel.sendMessage('resumed').then(() => {dispatcher.resume();});
					} else if (m.content.startsWith(prefix + 'skip')){
						msg.channel.sendMessage('skipped').then(() => {
							queue[msg.guild.id].looping=false;
							dispatcher.end();
						});
					} else if (m.content.startsWith(prefix + 'volume+')){
						if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
						msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					} else if (m.content.startsWith(prefix + 'volume-')){
						if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
						msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					} else if (m.content.startsWith(prefix + 'time')){
						msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
					} else if (m.content.startsWith(prefix + 'loop')){
						msg.channel.sendMessage(`Looping **${song.title}**. To exit loop, use !skip`).then(()=>{queue[msg.guild.id].looping=true})
					}
				});
				dispatcher.on('end', () => {
					collector.stop();
					if (queue[msg.guild.id].looping){
						play(song);
					}else{
						play(queue[msg.guild.id].songs[0]);
					}
				});
				dispatcher.on('error', (err) => {
					return msg.channel.sendMessage('error: ' + err).then(() => {
						collector.stop();
						queue[msg.guild.id].songs.shift();
						play(queue[msg.guild.id].songs[0]);
					});
				});
			})(queue[msg.guild.id].songs[0]);
		},
		description: "Make Musicbot play the song queue in current voice channel.",
		discrete: true
	},
	'join': {
		process: (msg) => {
			return new Promise((resolve, reject) => {
				const voiceChannel = msg.member.voiceChannel;
				if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
				voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
			});
		},
		description: "Musicbot joins your channel.",
		discrete: true
	},
	'add': {
		process: (msg) => {
			let url = msg.content.split(' ')[1];
			if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after !add`);
			yt.getInfo(url, (err, info) => {
				if(err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
				if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
				queue[msg.guild.id].defaulting = false;
				queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
				msg.channel.sendMessage(`added **${info.title}** to the queue`);
			});
		},
		description: "Add youtube link to music queue.",
		discrete: true
	},
	'queue': {
		process: (msg) => {
			if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with !add`);
			let tosend = [];
			queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
			msg.channel.sendMessage(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
		},
		description: "View music queue.",
		discrete: true
	},
	'forceadd': {
		process: (msg) => {
			if (bot.checkRole(msg, "Elder")) {
				let target = msg.guild.member(msg.mentions.users.first());
				level.forceAdd(target.user.id,msg.guild.id,target.user.username);
			}  else {
				bot.reject(msg);
			}
		}
	}
}


bot.login(discord_auth.token);

bot.on('ready', ()=> {
	console.log("Hey!");
	level = require('./nifty/level.js')(bot,knex);
	bot.user.setStatus(`online`,`Say ${prefix}help`)
	.then((user)=> {
		console.log(`${bot.timestamp()} Eyebot Online\n---`)
	})
	.then(()=>{
		let guildArr = bot.guilds.array();
		// Join the last channel of every guild that the bot is in.
		console.log(`Joined servers: ${guildArr.length}`);
		for (guild in guildArr) {
			tempCollection = guildArr[guild].channels.filter((channel)=> {
				return channel.type === "voice";
			});
			console.log(`${guildArr[guild].name}, ${tempCollection.array().length}`);
			tempCollection.find("position",tempCollection.array().length-1).join().then(connection => {
				connection.playStream(yt(data.defaultSong, { audioonly: true }), { passes : 1 });
			})
		}
	});
})

bot.on('message', (msg) => {
	if (msg.author.bot||msg.system||msg.tts||msg.channel.type === 'dm' || data.blacklistedRoles.indexOf(msg.member.highestRole.name) != -1|| bot.checkRole(msg,"Blacklisted") ) return;
	// if not something the bot cares about, exit out
	if(msg.content.startsWith(prefix)) {
		//Trim the mention from the message and any whitespace
		let command = msg.content.substring(msg.content.indexOf(prefix),msg.content.length).trim();
		if (command.startsWith(prefix)) {
			//Get command to execute
			let to_execute = command.split(prefix).slice(1).join().split(' ')[0];
			//Get string after command
			let argument = command.split(prefix).slice(1).join().split(' ').slice(1).join(" ");
			if (commands[to_execute]) {
				commands[to_execute].process(msg, argument)
			}
		}  else {
			//once every x minutes, give poster y xp
			return level.msgXp(msg,3,5);
		}
	}
})

bot.on('guildMemberAdd', (guild, member) => {
	console.log(`${bot.timestamp()} user ${member.username} joined channel.`)
	guild.channels.find('position',0).sendMessage(`Outsider spotted in the area: **${member.user.username}**`);
	member.sendMessage(data.motd);
})

//HTTP server stuff
var http = require('http');
var express = require('express');
var app = express();
var port = 3030;

app.get('/', function(req,res) {
	console.log("Heard the boop");
	res.send("Hello World");
})

app.listen(port, function(){
	console.log("Listening on port: " + port);
})

module.exports = bot;
