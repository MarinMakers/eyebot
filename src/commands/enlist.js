// const bot = require('../bot')

module.exports = {
  description: 'Enlist a new member to the faction. Requires permissions.',
  process: async msg => {
    if (await checkRole(msg, ['Head Scribe', 'Admin', 'Elder'])) {
      if (msg.mentions.users.first() !== undefined) {
        let target = msg.guild.member(msg.mentions.users.first())
        await target.addRoles([msg.guild.roles.find('name', 'Initiate').id])
        await target.setNickname(`Initiate ${target.user.username}`)
        return target.user.send('Welcome, ' + target.nickname)
      } else {
        return msg.channel.send('Mention a user to enlist.')
      }
    } else {
      await console.log(`${msg.author.username} tried to use a command without privs`)
    }
    
    // return bot.reject(msg)
  }
}
