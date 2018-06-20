// const bot = require('../bot')

module.exports = {
  usage: '<@target>',
  description: 'Revoke bot privileges from target. Requires permissions.',
  process: async msg => {
    if (await checkRole(msg, ['Head Scribe', 'Admin', 'Elder'])) {
      if (msg.mentions.users.first() !== undefined) {
        let target = msg.guild.member(msg.mentions.users.first())
        await target.addRole(msg.guild.roles.find('name', 'Blacklisted').id)
        await msg.channel.send(`${target} has had their bot privileges revoked until further notice.`)
      } else {
          msg.channel.send('Mention a user to revoke.')
      }
    } else {
        await console.log(`${msg.author.username} tried to use a command without privs`)
    }
  }
}
