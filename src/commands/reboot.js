const { checkRole } = require('../helpers')

module.exports = {
  description: 'Reboots the bot. Must have privileges to execute.',
  discrete: true,
  process: async msg => {
    if (await checkRole(msg, ['Head Scribe', 'Elder'])) {
      await msg.channel.send('*Beep boop, click*')
      await console.log('Being shut down by ' + msg.author.username)
      //process.exit()
    } else {
      await console.log(`${msg.author.username} tried to use a command without privs`)
    }
  }
}
