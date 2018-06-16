const { ranks } = require('../constants')

module.exports = {
  description: 'Lint either one user or all users',
  usage: '<target>',
  process: async (msg, argument) => {
    const targets = msg.mentions.members.array().length > 0
      ? msg.mentions.members.array()
      : msg.guild.members.array()
    for (const member of targets) {
      const memberRanks = member.roles.array().filter(role => Object.keys(ranks).indexOf(role.name) !== -1)
      if (memberRanks.length > 1) {
        const ranksToRemove = memberRanks
          .sort((a, b) => b.calculatedPosition - a.calculatedPosition) // Get roles in descending order
          .slice(1) // Get all entries including and after index 1
        try {
          await member.removeRoles(ranksToRemove)
        } catch (err) {
          console.log(err)
        }
      }
    }
    msg.channel.send('Done. Now don\'t fuck it up again :D')
  }
}
