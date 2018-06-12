const bot = require('../bot')

module.exports = {
  usage: '<@target>',
  description: 'Revoke bot privileges from target. Requires permissions.',
  process: msg => {
    if (msg.mentions.users.first() !== undefined) {
      let target = msg.guild.member(msg.mentions.users.first())
      if (target.highestRole.name === 'Elder') {
        msg.author.addRole(msg.guild.roles.find('name', 'Blacklisted').id).then((value) => {
          msg.channel.send('_The bot fries your hand as you attempt this treasonous act, rendering you incapable of interacting with the bot any further_')
        })
      } else {
        if (bot.checkRole(msg, ['Elder', 'Council'])) {
          target.addRole(msg.guild.roles.find('name', 'Blacklisted').id).then((value) => {
            msg.channel.send(`${target} has had their bot privileges revoked until further notice.`)
          }, (reason) => {
            console.log(reason)
          })
        } else {
          bot.reject(msg)
        }
      }
    } else {
      msg.channel.send('Mention a user to revoke.')
    }
  }
}
