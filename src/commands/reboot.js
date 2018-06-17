const bot = require('../bot')

module.exports = {
  description: 'Reboots the bot. Must have privileges to execute.',
  discrete: true,
  process: async msg => {
    if (await bot.checkRole(msg, ['Head Scribe', 'Elder'])) {
      await msg.channel.send('*Beep boop, click*')
      await console.log('Being shut down by ' + msg.author.username)
      process.exit()
    } else {
      bot.reject(msg)
    }
  }
}
