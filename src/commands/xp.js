const { level, checkRole } = require('../helpers')

module.exports = {
  description: 'Give XP to a user. Need permissions.',
  usage: '@<username> <#>',
  process: async (msg, argument) => {
    if (await checkRole(msg, ['Elder', 'Sentinel', 'Star Paladin Commander', 'Star Paladin', 'Paladin Commander', 'Paladin Captain', 'Paladin', 'Head Scribe', 'Senior Scribe'])) {
      await level.give(msg, argument)
    } else {
      await console.log(`${msg.author.username} tried to use a command without privs`)
    }
  }
}
