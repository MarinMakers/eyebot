const bot = require('../bot')
const level = require('../helpers/level')

module.exports = {
  description: 'Give XP to a user. Need permissions.',
  usage: '@<username> <#>',
  process: async (msg, argument) => {
    if (await bot.checkRole(msg, ['Elder', 'Council'])) {
      await level.give(msg, argument)
    } 
    else {
      await bot.reject(msg)
    }
  }
}