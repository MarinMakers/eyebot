//This is the main script for the bot. To start the bot, run this script with node
const Discord = require("discord.js");
const discord_auth = require('./auth.json');
const botParameters = {
	"localMode": (process.argv.indexOf("-l") != -1 || process.argv.indexOf("-local") != -1 ? true : false)
}

if (botParameters.localMode) {
	console.log("Starting bot in local mode..")
}

const bot = new Discord.Client();

const
	//Brotherhood of Steel Discord server id
	serverID= "231894413276741652",
	// `vault-door`'s id
	landingPageId = "231894413276741652",
	// Bot's trigger character
	prefix = "!",
	// Greeting Message
	motd = "```diff\n==BEGIN TRANSMISSION==\n\n\"This is Elder McNamara of the Brotherhood of Steel. The Brotherhood is looking for able-bodied recruits that want to take part in restoring order to the Wasteland. If this is you, confirm onscreen and make your way to the map location.\"\n\n+\t> ACCEPT (say '!join')\n+\t> DECLINE```",
	// Credits
	credits = "```This Eyebot unit has been repurposed by Elder McNamara to serve the Brotherhood of Steel.```"


const fs = require('fs');
const child_process = require('child_process');

//Custom modules
const decider = require('./nifty/decisions.js')(bot); 
const gitHelper = require('./nifty/git.js')(bot);
const todo = require('./nifty/todo.js')(bot);

//call checkRole(message.sender, message.server, 'role')
bot.checkRole = (user, server, role) => {
	for (var i = 0; i < server.roles.length; i++){
		if(server.roles[i].name == role && user.hasRole(server.roles[i])){
			return true;
		}
	}
	return false;
}

var getMethod = (argument) => {
	//Grab first word in a command
	if(argument.indexOf(' ') != -1){
		return argument.substring(0, argument.indexOf(' '));
	}else{
		return argument;
	}
}

var getParameter = (argument) => {
	return argument.substring(argument.indexOf(' ')+1, argument.length);
}

const commands = {
	'!todo': {
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
	'!ping': {
		process: (message, argument) => {
			message.channel.sendMessage(message.author + " pong!");
			console.log(message.author.username);
		},
		description: "Check if the bot is online."
	},
	'!pull': {
		process: (message, argument) => {
			if (bot.checkRole(message.author, message.server, 'developer')){
				gitHelper.pull((msg) => {
					message.channel.sendMessage(msg);
				})
			}else{
				message.channel.sendMessage("You don't have enough badges to train me!");
			}
		},
		description: "Pulls the bot's code from github on to the server. You must have the role 'developer' to use this functionality."
	},
	'!help': {
		process: (message, argument) => {
			let commandList = '```'
			for (cmd in commands) {
				let command = cmd;
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
			message.author.sendMessage(commandList+'```')
		},
		description: "PM's user a list of commands"
	},
	'!roll': {
		process: (message, argument) => {
			decider.rollDice(argument, (result) => {
				message.channel.sendMessage(result)
			})
		},
		usage: "<d20 syntax>",
		description: "Roll dice using d20 syntax"
	},
	'!say': {
		process: (message, argument) => {
			message.channel.sendMessage(argument);
		},
		usage: "<string>",
		description: "Make the bot say something"
	},
	'!kill': {
		process: (message, argument) => {
			if (bot.checkRole(message.author, message.server, 'Elder') || bot.checkRole(message.author, message.server, 'Head Scribe')) {
				console.log("Being shut down by " + message.author.username);
				message.channel.sendMessage("*Beep boop, click*").then(()=> {
					process.exit();
				});
			}  else {
				message.channel.sendMessage("Insufficient Privileges.");
			}
		},
		description: "This kills the robot. Must have privileges to execute."
	},
	'!task': {
		process: (message, argument) => {
			commands["!todo"].process(message,argument)
		},
		description: "Alias for !todo"
	},
	'!join': {
		process: (message,argument) => {

		},
		description: "Join the Brotherhood of Steel as an Initiate."
	},
	'!info': {
		process: (message,argument) => {
			message.channel.sendMessage(credits);
		},
		description: "Credits for the bot."
	}
}


bot.login(discord_auth.token);

bot.on('ready', ()=> {
	console.log("Eyebot Online")
})

bot.on('message', (msg) => {
	if (msg.content === "!join") {
		console.log("tried to join via PM");
	}
	//msg.guild.roles.find("name", "Initiate").id
	// if not something the bot cares about, exit out
	if(!msg.content.startsWith(prefix)&&botParameters.localMode||!msg.isMentioned(bot.user)&&!botParameters.localMode || msg.author.bot) return;
	
	if (msg.member.highestRole.name === "@everyone" && msg.content === "!join") {
		console.log("Yo");
		msg.member.addRole(msg.guild.roles.find("name", "Initiate").id);
	}

	//Trim the mention from the message and any whitespace
	var command = msg.content.substring(msg.content.indexOf(prefix),msg.content.length).trim();
	if (command.startsWith(prefix)) {
		var to_execute = command.split(' ')[0];
		var argument = command.substring(command.indexOf(' ')+1, command.length);
		if (commands[to_execute]) {
			commands[to_execute].process(msg, argument)
		}  else {
			msg.channel.sendMessage("Unknown Command :(");
		}
	}
})

bot.on('guildMemberAdd', (guild, member) => {
    guild.channels.get(landingPageId).sendMessage("Wastelander spotted in the area! " + member);
    member.sendMessage(motd)
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
