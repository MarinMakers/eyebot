const { level, checkRole } = require('../helpers')

module.exports = {
  description: 'Give XP to a user. Need permissions.',
  usage: '@<username> <#>',
  process: async (msg, argument) => {
    if (await checkRole(msg, ['Head Scribe', 'Admin', 'Elder'])) {
      await level.give(msg, argument)
    } else {
      }
  }
}
