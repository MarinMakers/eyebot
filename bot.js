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

//Custom modules
const decider = require('./nifty/decisions.js')(bot); 
const gitHelper = require('./nifty/git.js')(bot);
const todo = require('./nifty/todo.js')(bot);
var level;

//bot methods
bot.checkRole = (msg, role) => {
	let foundRole = msg.guild.roles.find('name',role);
	 if (msg.member.roles.has(foundRole.id)){
	 	return true;
	 } else {
		return false;
	}
}
bot.reject = (msg)=> {
	msg.channel.sendCode('diff','- Access Denied');
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
				todo.add(taskToAdd, msg, messageFunction);
			}  else if (method === "remove"){
				var ids = getParameter(argument);
				todo.remove(ids, msg, messageFunction);
			}  else if (method === "complete"){
				var id = getParameter(argument);
				todo.complete(id, msg, messageFunction);
				// complete tasks
			}  else if (method === "export") {
				todo.exportList(msg, messageFunction);
			}  else{
				todo.showTasks(msg, messageFunction);
			}
		},
		usage: "[add <string>] [remove <id>] [complete <id>]",
		description: "Interact with the bot's todo lists."
	},
	'ping': {
		process: (msg, argument) => {
			msg.channel.sendMessage(msg.author + " pong!");
			console.log(msg.author.username);
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
				console.log("Yep")
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
			commands["!todo"].process(msg,argument)
		},
		description: "Alias for !todo"
	},
	'enlist': {
		process: (msg,argument) => {

		},
		description: "Join the Brotherhood of Steel."
	},
	'propaganda': {
		process: (msg,argument) => {
			fs.readdir('./assets/images', (err, files) => {
				if (err) {
					msg.channel.sendMessage("No assets found.")
				}  else {
					files = files.filter((file)=> {
						return file.substring(0,1) != '.';
					});
					console.log(files);
					msg.channel.sendFile('assets/images/'+ files[Math.floor(Math.random()*files.length)]);
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
		}
	},
	'xp': {
		process: (msg,argument)=> {
			if (bot.checkRole(msg,"Elder")||bot.checkRole(msg,"Head Scribe")||bot.checkRole(msg,"Head Paladin")||bot.checkRole(msg,"Head Knight")) {
				level.give(msg,argument);
			}  else bot.reject(msg);
		}
	},
	'play': {
		process: (msg) => {
			if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with !add`);
			if (!msg.guild.voiceConnection) return commands['join'].process(msg).then(() => commands['play'].process(msg));
			if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
			let dispatcher;
			queue[msg.guild.id].playing = true;

			console.log(queue);
			(function play(song) {
				console.log(song);
				if (song === undefined) {
					song = ({url:data.defaultSong});
				};
				if (!queue[msg.guild.id].looping && song.title){
					msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
				}
				dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : 1 });
				let collector = msg.channel.createCollector(m => m);
				console.log(collector);
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
					if (!queue[msg.guild.id].looping){
						queue[msg.guild.id].songs.shift();
					}
					play(queue[msg.guild.id].songs[0]);
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
	}
}


bot.login(discord_auth.token);

bot.on('ready', ()=> {
	console.log("Eyebot Online");
	let guildArr = bot.guilds.array();

	// Join the last channel of every guild that the bot is in.
	for (guild in guildArr) {
		tempCollection = guildArr[guild].channels.filter((channel)=> {
			return channel.type === "voice"
		})	
		tempCollection.find("position",tempCollection.array().length-1).join().then(connection => {
			connection.playStream(yt(data.defaultSong, { audioonly: true }), { passes : 1 });
		})
	}
	level = require('./nifty/level.js')(bot);
})

bot.on('message', (msg) => {
	// if not something the bot cares about, exit out
	if (msg.channel.type != 'dm' && msg.member.highestRole.name === "@everyone" && msg.content === "!enlist") {
		msg.member.addRole(msg.guild.roles.find("name", "Initiate").id).then((value) => {
			msg.member.setNickname(`Initiate ${msg.author.username}`).then((value) => {
				msg.channel.sendMessage("Welcome, Initiate.");
			}, (reason) => {
				console.log(reason);
			});
		}, (reason) => {
			console.log(reason);
		});
	};

	if(!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === 'dm' || msg.channel.type != 'dm' && data.blacklistedRoles.indexOf(msg.member.highestRole.name) != -1) return;

	//Trim the mention from the message and any whitespace
	var command = msg.content.substring(msg.content.indexOf(prefix),msg.content.length).trim();
	if (command.startsWith(prefix)) {
		let to_execute = command.split(prefix).slice(1).join().split(' ')[0];
		let argument = command.split(prefix).slice(1).join().split(' ').slice(1).join(" ");
		if (commands[to_execute]) {
			commands[to_execute].process(msg, argument)
		}
	}
})

bot.on('guildMemberAdd', (guild, member) => {
    guild.channels.get(data.vaultDoorID).sendMessage(`Trespasser spotted in the area: **${member.user.username}**`);
    member.sendMessage(data.motd);
})

// //HTTP server stuff
// var http = require('http');
// var express = require('express');
// var app = express();
// var port = 3030;		

// app.get('/', function(req,res) {
// 	console.log("Heard the boop");
// 	res.send("Hello World");
// })

// app.listen(port, function(){
// 	console.log("Listening on port: " + port);
// })

module.exports = bot;
