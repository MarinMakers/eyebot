const Discord = require('discord.js')
const bot = new Discord.Client()

var level = require('./helpers/level')
const masterID = '127060142935113728'
const { prefix } = require('./constants')
const commands = require('./commands')

// bot methods
bot.checkRole = (msg, roleArr) => {
  if (msg.author.id === masterID) return true
  for (var i = roleArr.length - 1; i >= 0; i--) {
    if (msg.guild.roles.find('name', roleArr[i]) !== undefined) {
      let foundRole = msg.guild.roles.find('name', roleArr[i])
      if (msg.member.roles.has(foundRole.id)) {
        console.log(`${msg.author.username} has role ${roleArr[i]}`)
        return true
      }
    } else {
      console.log(`WARNING! Role not found: ${roleArr[i]}`)
      return false
    }
  }
  return false
}

bot.on('ready', async () => {
  await bot.user.setStatus(`online`, `Say ${prefix}help`)
  console.log(`Eyebot Online`)
  let guildArr = bot.guilds.array()
  // Join the last channel of every guild that the bot is in.
  console.log(`Joined servers: ${guildArr.length}`)
  for (const guild of guildArr) {
    console.log(`\t${guild.name}`)
  }
})

bot.on('message', async msg => {
  // if not something the bot cares about, exit out
  if (msg.author.bot || msg.system || msg.tts || msg.channel.type === 'dm' || bot.checkRole(msg, ['Blacklisted'], true)) return
  if (!msg.content.startsWith(prefix)) {
    // once every x minutes, give poster y xp
    return level.msgXp(msg, 5, 3)
  } else {
    // Trim the mention from the message and any whitespace
    let command = msg.content.substring(msg.content.indexOf(prefix), msg.content.length).trim()
    if (command.startsWith(prefix)) {
      const queryArr = command.split(prefix).slice(1).join().split(' ')
      // Get command to execute
      let commandToExecute = queryArr.pop()
      // Get string after command
      let argument = queryArr.join(' ')
      if (commands[commandToExecute]) {
        try {
          commands[commandToExecute].process(msg, argument)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
})

bot.on('guildMemberAdd', (guild, member) => {
  console.log(`user ${member.user.username} joined channel.`)
  guild.defaultChannel.send(`Outsider spotted in the area: ${member}`)
})

module.exports = bot
