const bot = require('../bot.js')
const knex = require('../utils/database')
const first = require('lodash.first')

// input level integer, output base xp amount
const xpCost = level => 25 * (3 * level + 2) * (level - 1)

// input xp amount, return level
const quadratic = xpCost => {
  let a = 75
  let b = -25
  let c = -50 - xpCost
  return Math.floor((-(b) + (Math.pow((Math.pow(b, 2) - 4 * a * c), 0.5))) / (2 * a))
}

// returns amount of XP remainder over lvl
const xpRemainder = xp => xp - xpCost(quadratic(xp))

// Retrieve info based on your character
var get = async msg => {
  const users = await knex.select('*').from('users').where({
    'user_id': msg.author.id,
    'server_id': msg.guild.id
  })
  const user = first(users)
  if (user) {
    let xp = user.message_xp + user.quest_xp
    let level = quadratic(xp)
    await msg.channel.send(`${msg.member}: **Level ${level}** - **${xpRemainder(xp)}/${xpCost(level + 1) - xpCost(level)} XP**`)
  } else {
    await msg.channel.send(`${msg.member}: **Level 0** - **0/${xpCost(2)} XP**`)
    await addUser(msg.author.id, msg.guild.id)
  }
}

// Give small amount of XP every amount of time
const msgXp = async (msg, minutes, amount) => {
  const users = await knex.select('*').from('users').where({
    'user_id': msg.author.id,
    'server_id': msg.guild.id
  })
  const user = first(users)
  if (user) {
    if ((new Date() - new Date(user.last_msg)) < (60000 * minutes)) return

    let xp = user.message_xp + user.quest_xp
    let newXp = xp + amount

    if (quadratic(xp) < quadratic(newXp)) {
      msg.channel.send(`${msg.author} increased to **Level ${quadratic(newXp)}!**`)
      console.log(`${bot.timestamp()} ${msg.member.nickname} grew to level ${quadratic(newXp)}`)
    }
    await knex('users').where('id', user.id).update({
      message_xp: user.message_xp + amount,
      last_msg: new Date()
    })
  } else {
    await addUser(msg.author.id, msg.guild.id)
  }
}

// !xp add @Mcnamara 400
const give = async (msg, argument) => {
  let target = msg.mentions.users.first()
  if (!target) return msg.channel.send('User data not found.')
  const users = await knex('users').select('*').where({
    'user_id': target.id,
    'server_id': msg.guild.id
  })
  if (users.length > 0) {
    let user = first(users)
    let tempArr = msg.content.trim().split(' ')
    let xpAmount = parseInt(tempArr[tempArr.length - 1])
    let oldTotalXp = user.quest_xp + user.message_xp
    let newQuestXp = user.quest_xp + xpAmount
    let newTotalXp = newQuestXp + user.message_xp

    if (quadratic(oldTotalXp) < quadratic(newTotalXp)) {
      await msg.channel.send(`${target} increased to **Level ${quadratic(newTotalXp)}!**`)
      console.log(`${target} grew to level ${quadratic(newTotalXp)}`)
    }

    await knex('users').where('id', user.id).update({
      quest_xp: newQuestXp
    })
    const statusMessage = await msg.channel.send(`${xpAmount}xp given to ${msg.mentions.users.first().username}`)
    setTimeout(statusMessage.delete(), 3000)
  }
}

const lookUpID = async (msg, argument) => {
  const users = await knex
    .select('*')
    .from('users')
    .where({
      'user_id': argument,
      'server_id': msg.guild.id
    })
  const user = first(users)
  if (user) {
    try {
      let target = bot.users.get(user.user_id)
      let xp = user.quest_xp + user.message_xp
      let level = quadratic(xp)
      await msg.channel.send(`${target.username}\n**Level ${level}** - **${xpRemainder(xp)}/${xpCost(level + 1) - xpCost(level)} XP**\nMessage XP: ${user.message_xp}\nQuest XP: ${user.quest_xp}`)
    } catch (err) {
      await msg.channel.send(err)
    }
  } else {
    await msg.channel.send('User not found.')
  }
}

const addUser = async (userId, serverId) => {
  const users = await knex
    .select('id')
    .from('users')
    .where({'user_id': userId, 'server_id': serverId})
  const user = first(users)
  if (!user) {
    await knex('users').insert({
      'user_id': userId,
      'server_id': serverId,
      'quest_xp': 0,
      'message_xp': 0,
      'last_msg': new Date()
    })
  } else {
    return false
  }
}

module.exports = {
  get,
  give,
  msgXp,
  addUser,
  lookUpID
}
