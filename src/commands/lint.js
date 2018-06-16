const { ranks } = require('../constants')
const first = require('lodash.first')
const knex = require('../utils/database')
const { xpCost, quadratic } = require('../helpers/level')

const lintRank = async member => {
  const memberRanks = member.roles.array().filter(role => Object.keys(ranks).indexOf(role.name) !== -1)
  if (memberRanks.length > 1) {
    const ranksToRemove = memberRanks
      .sort((a, b) => b.calculatedPosition - a.calculatedPosition) // Get roles in descending order
      .slice(1) // Get all entries including and after index 1
    try {
      return member.removeRoles(ranksToRemove)
    } catch (err) {
      return member
    }
  } else return member
}

const xpGrandfather = async ({member, msg}) => {
  const memberRank = first(await member.roles.array().filter(role => Object.keys(ranks).indexOf(role.name) !== -1))
  if (memberRank && member) {
    if (ranks[memberRank.name] !== 'Head Scribe') return
    const rankLevel = ranks[memberRank.name].acquiredAtLevel
    const user = first(await knex.select('*').from('users').where({
      'user_id': member.id,
      'server_id': msg.guild.id
    }))
    if (!user) return
    const xp = user.message_xp
    const newXp = xpCost(rankLevel)
    await knex('users').where('id', user.id).update({
      message_xp: newXp
    })
    if (quadratic(xp) < quadratic(newXp)) {
      msg.channel.send(`${member} increased to **Level ${quadratic(newXp)}!**`)
      console.log(`${msg.member.nickname} grew to level ${quadratic(newXp)}`)
    }
  }
}

module.exports = {
  description: 'Lint either one user or all users',
  usage: '<target>',
  process: async (msg, argument) => {
    const targets = msg.mentions.members.array().length > 0
      ? msg.mentions.members.array()
      : msg.guild.members.array()

    await Promise.all(targets.map(async member => {
      await lintRank(member)
      await xpGrandfather({member, msg})
    }))
    msg.channel.send('Done. Now don\'t fuck it up again :D')
  }
}
