const { backup, checkRole } = require('../helpers')

module.exports = {
  description: 'Backs up the configuration of every server the bot has joined.',
  discrete: true,
  process: async msg => {
    if (await checkRole(msg, ['Head Scribe', 'Elder'])) {
      await backup(msg);
    } else {
      //
    }
  }
}
