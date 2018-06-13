const bot = require('../bot')
const level = require('../helpers/level')

module.exports = {
  description: 'Add users to database',
  discrete: true,
  process: async msg => {
    if (bot.checkRole(msg, ['Elder', 'Council'])) {
      let target = msg.guild.member(msg.mentions.users.first())
      level.addUser(target.user.id, msg.guild.id)
    } else {
      bot.reject(msg)
    }
  }
}
