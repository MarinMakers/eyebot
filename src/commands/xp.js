const bot = require('../bot')
const level = require('../helpers/level')

module.exports = {
  description: 'Give XP to a user. Need permissions.',
  usage: '@<username> <#>',
  process: (msg, argument) => {
    if (bot.checkRole(msg, ['Elder', 'Council'])) {
      level.give(msg, argument)
    } else bot.reject(msg)
  }
}
