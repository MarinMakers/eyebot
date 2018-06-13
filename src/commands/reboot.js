const bot = require('../bot')

module.exports = {
  description: 'Reboots the bot. Must have privileges to execute.',
  discrete: true,
  process: async msg => {
    if (bot.checkRole(msg, ['Elder', 'Head Scribe'])) {
      await msg.channel.send('*Beep boop, click*')
      console.log('Being shut down by ' + msg.author.username)
      process.exit(0)
    } else {
      bot.reject(msg)
    }
  }
}
