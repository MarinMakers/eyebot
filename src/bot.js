const Discord = require('discord.js')
const bot = new Discord.Client()

var level = require('./helpers/level')
const masterID = '127060142935113728'
const { prefix } = require('./constants')
const commands = require('./commands')

// bot methods
bot.checkRole = async (msg, roleArr) => {
  if (msg.author.id === masterID) return true
  for (let i = roleArr.length - 1; i >= 0; i--) {
    if (msg.guild.roles.find('name', roleArr[i]) !== undefined) {
      let foundRole = msg.guild.roles.find('name', roleArr[i])
      if (msg.member.roles.has(foundRole.id)) {
        await console.log(`${msg.author.username} has role ${roleArr[i]}`)
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
  console.log(`DUST-3 Online`)
  const guilds = await bot.guilds.array()
  console.log(`Joined servers: ${guilds.length}`)
  const promises = guilds.map(async guild => {
    const members = guild.members.array()
    return members.map(async member => level.addUser(member.user.id, guild.id))
  })
  await Promise.all(promises)
})

bot.on('message', async msg => {
  // if not something the bot cares about, exit out
  if (msg.author.bot || msg.system || msg.tts || msg.channel.type === 'dm') return

  // once every x minutes, give poster y xp
  if (!msg.content.startsWith(prefix)) return level.msgXp(msg, 3, 3)

  // Trim the mention from the message and any whitespace
  let command = msg.content.substring(msg.content.indexOf(prefix), msg.content.length).trim()
  if (command.startsWith(prefix)) {
    const queryArr = command.split(prefix).slice(1).join().split(' ')
    let commandToExecute = queryArr.shift()
    let argument = queryArr.join(' ')
    if (commands[commandToExecute]) {
      try {
        await commands[commandToExecute].process(msg, argument)
      } catch (error) {
        console.log(error)
      }
    } else {
      msg.react('🤷')
    }
  }
})

bot.on('guildMemberAdd', async member => {
  const guild = member.guild
  console.log(`${member.user.username} joined ${guild.name}.`)
  await level.addUser(guild.id, member.id)
})

module.exports = bot
