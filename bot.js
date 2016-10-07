//This is the main script for the bot. To start the bot, run this script with node
try {
	const Discord = require("discord.js");
} catch (e){
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}

try {
	const discord_auth = require('./auth.json');
} catch (e) {
	console.log("Auth file not found!");
}

var botParameters = {
	"localMode": (process.argv.indexOf("-l") != -1 || process.argv.indexOf("-local") != -1 ? true : false)
}

if (botParameters.localMode) {
	console.log("Starting bot in local mode..")
}

const bot = new Discord.Client();

var fs = require('fs');
var Twitter = require('twitter');
var child_process = require('child_process');

//Custom modules
var twitterBot = require('./nifty/twitter.js')(bot);
var decider = require('./nifty/decisions.js')(bot);
var gitHelper = require('./nifty/git.js')(bot);
var lastSeen = require('./nifty/lastseen.js')(bot);
var todo = require('./nifty/todo.js')(bot);

//initialize the twitterClient variable, but don't give it a value
var twitterClient;

//call checkRole(message.sender, message.server, 'role')
bot.checkRole = function(user, server, role){
	for (var i = 0; i < server.roles.length; i++){
		if(server.roles[i].name == role && user.hasRole(server.roles[i])){
			return true;
		}
	}
	return false;
}

var getMethod = function(argument){
	//Grab first word in a command
	if(argument.indexOf(' ') != -1){
		return argument.substring(0, argument.indexOf(' '));
	}else{
		return argument;
	}
}

var getParameter = function(argument){
	return argument.substring(argument.indexOf(' ')+1, argument.length);
}

var commands = {
	'!todo': {
		//doing this NoSQL because yes.
		process: (message, argument) => {

			var messageFunction = function(msg){
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
				todo.exportList(message, messageFunction,bot);
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
			console.log(message.author);
		},
		description: "dumps info on the user to the console of the server."
	},
	'!tableflip': {
		process: (message,argument) => {
			message.channel.sendMessage("(╯°□°）╯︵ ┻━┻");
		},
		description: "Flip a table out of frustration."
	},
	'!pull': {
		process: (message, argument) => {
			if (bot.checkRole(message.author, message.server, 'developer')){
				gitHelper.pull(function(msg){
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
			message.author.sendMessage("Available Commands: ", function() {
				for (var cmd in commands) {
					var info = cmd;
					var usage = commands[cmd].usage;
					if (usage) {
						info += " " + usage;
					}
					var description = commands[cmd].description;
					if(description){
						info += "\n\t" + description;
					}
					message.author.sendMessage(info);
				}
			})
		},
		description: "PM's users a list of commands and invocation"
	},
	'!roll': {
		process: (message, argument) => {
			decider.rollDice(argument, function(result){
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
				message.channel.sendMessage("Beep boop, powering down.").then(function() {
					process.exit();
				});
			}  else {
				message.channel.sendMessage("You don't have enough badges to train me!");
			}
		},
		description: "This kills the robot. Must have proper privileges to execute."
	},
	'!w2g': {
		process: (message, argument) => {
			var watch2getherUrl = "https://www.watch2gether.com/go#" + getParameter(argument);
			message.channel.sendMessage("watch2gether link: " + watch2getherUrl);
		},
		description: "Create a watch2gether.com lobby"
	},
	'!task': {
		process: (message, argument) => {
			commands["!todo"].process(message,argument)
		},
		description: "Alias for !todo"
	}
}


bot.login(discord_auth.token);

bot.on('ready', ()=> {
	console.log("Eyebot Online")
})

bot.on('message', function(msg){
	// if not in local and 
	if(!msg.content.startsWith("!")&&botParameters.localMode||!msg.isMentioned(bot.user)&&!botParameters.localMode || msg.author.bot) return;
	console.log(msg.member.roles);
	//lastSeen.learn(message);
	//if bot is mentioned
	//Trim the mention from the message and any whitespace
	var command = msg.content.substring(msg.content.indexOf("!"),msg.content.length).trim();
	if (command.substring(0,1) === "!") {
		var to_execute = command.split(' ')[0];
		var argument = command.substring(command.indexOf(' ')+1, command.length);
		if (commands[to_execute]) {
			commands[to_execute].process(msg, argument)
		}  else {
			msg.channel.sendMessage("Unknown Command :(");
		}
	}
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
