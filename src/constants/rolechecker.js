const bot = require('../bot')

const masterID = '127060142935113728'

bot.checkRole = async (msg, roleArr) => {
    console.log(bot)
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