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
		process: (message, argument) => {
			// Get rid of this at some point
			var messageFunction = (msg) => {
				message.channel.sendMessage(msg);
			}

			var method = getMethod(argument);
			
			if (method === "add"){
				var taskToAdd = getParameter(argument);
				todo.add(taskToAdd, message, messageFunction);
			}  else if (method === "remove"){
				var ids = getParameter(argument);
				todo.remove(ids, message, messageFunction);
			}  else if (method === "complete"){
				var id = getParameter(argument);
				todo.complete(id, message, messageFunction);
				// complete tasks
			}  else if (method === "export") {
				todo.exportList(message, messageFunction);
			}  else{
				todo.showTasks(message, messageFunction);
			}
		},
		usage: "[add <string>] [remove <id>] [complete <id>]",
		description: "Interact with the bot's todo lists."
	},
	'ping': {
		process: (message, argument) => {
			message.channel.sendMessage(message.author + " pong!");
			console.log(message.author.username);
		},
		description: "Check if the bot is online."
	},
	'pull': {
		process: (message, argument) => {
			if (bot.checkRole(message, 'dev')){
				gitHelper.pull((msg) => {
					message.channel.sendMessage(msg);
				})
			}else{
				bot.reject(message);
			}
		},
		description: "Pulls the bot's code from github on to the server. You must have the role 'developer' to use this functionality.",
		discrete:true
	},
	'help': {
		process: (message, argument) => {
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
			message.author.sendMessage(commandList)
		},
		description: "Messages user list of commands"
	},
	'roll': {
		process: (message, argument) => {
			decider.rollDice(argument, (result) => {
				message.channel.sendMessage(result)
			})
		},
		usage: "<d20 syntax>",
		description: "Roll dice using d20 syntax"
	},
	'say': {
		process: (message, argument) => {
			message.channel.sendMessage(argument);
		},
		usage: "<string>",
		description: "Make the bot say something"
	},
	'kill': {
		process: (message, argument) => {
			if (bot.checkRole(message, 'Elder') || bot.checkRole(message, 'Head Scribe')) {
				console.log("Yep")
				message.channel.sendMessage("*Beep boop, click*").then(()=> {
					console.log("Being shut down by " + message.author.username);
					process.exit();
				});
			}  else {
				bot.reject(message);
			}
		},
		description: "This kills the robot. Must have privileges to execute.",
		discrete: true
	},
	'task': {
		process: (message, argument) => {
			commands["!todo"].process(message,argument)
		},
		description: "Alias for !todo"
	},
	'enlist': {
		process: (message,argument) => {

		},
		description: "Join the Brotherhood of Steel."
	},
	'propaganda': {
		process: (message,argument) => {
			fs.readdir('./assets/images', (err, files) => {
				if (err) {
					message.channel.sendMessage("No assets found.")
				}  else {
					files = files.filter((file)=> {
						return file.substring(0,1) != '.';
					});
					console.log(files);
					message.channel.sendFile('assets/images/'+ files[Math.floor(Math.random()*files.length)]);
				}
			})
		}
	},
	'info': {
		process: (message,argument) => {
			message.channel.sendMessage(data.credits);
		},
		description: "Credits for the bot."
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
				if (song === undefined) return msg.channel.sendMessage('Queue is empty').then(() => {
					queue[msg.guild.id].playing = false;
					msg.member.voiceChannel.leave();
				});
				msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
				dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : 1 });
				let collector = msg.channel.createCollector(m => m);
				collector.on('message', m => {
					if (m.content.startsWith(prefix + 'pause')) {
						msg.channel.sendMessage('paused').then(() => {dispatcher.pause();});
					} else if (m.content.startsWith(prefix + 'resume')){
						msg.channel.sendMessage('resumed').then(() => {dispatcher.resume();});
					} else if (m.content.startsWith(prefix + 'skip')){
						msg.channel.sendMessage('skipped').then(() => {dispatcher.end();});
					} else if (m.content.startsWith('volume+')){
						if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
						msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					} else if (m.content.startsWith('volume-')){
						if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
						msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					} else if (m.content.startsWith(prefix + 'time')){
						msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
					}
				});
				dispatcher.on('end', () => {
					collector.stop();
					queue[msg.guild.id].songs.shift();
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
		description: "Make Musicbot play the song queue in current voice channel."
	},
	'join': {
		process: (msg) => {
			return new Promise((resolve, reject) => {
				const voiceChannel = msg.member.voiceChannel;
				if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
				voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
			});
		},
		description: "Musicbot joins your channel."
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
		description: "Add youtube link to music queue."
	},
	'queue': {
		process: (msg) => {
			if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with !add`);
			let tosend = [];
			queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
			msg.channel.sendMessage(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
		},
		description: "View music queue."
	}
}


bot.login(discord_auth.token);

bot.on('ready', ()=> {
	console.log("Eyebot Online")
})

bot.on('message', (msg) => {
	// if not something the bot cares about, exit out

	if (msg.channel.type != 'dm' && msg.member.highestRole.name === "@everyone" && msg.content === "!enlist") {
		msg.member.addRole(msg.guild.roles.find("name", "Initiate").id).then((value) => {
			msg.member.setNickname("Initiate "+ msg.author.username).then((value) => {
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
		var to_execute = command.split(prefix).pop().split(' ')[0];
		var argument = command.substring(command.indexOf(' ')+1, command.length);
		if (commands[to_execute]) {
			commands[to_execute].process(msg, argument)
		}
	}
})

bot.on('guildMemberAdd', (guild, member) => {
    guild.channels.get(data.vaultDoorID).sendMessage("**__Trespasser spotted in the area__** " + member);
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
