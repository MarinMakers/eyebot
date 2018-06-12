const bot = require('../bot.js')
const knex = require('../utils/database')

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
var info = async msg => {
  const rows = await knex.select('*').from('users').where({
    'user_id': msg.author.id,
    'server_id': msg.guild.id
  })
  if (rows.length > 0) {
    let entry = rows[0]
    let xp = entry.message_xp + entry.quest_xp
    let level = quadratic(xp)
    msg.channel.sendMessage(`${msg.member}: **Level ${level}** - **${xpRemainder(xp)}/${xpCost(level + 1) - xpCost(level)} XP**`)
  } else {
    msg.channel.sendMessage(`${msg.member}: **Level 0** - **0/${xpCost(2)} XP**`)
    addUser(msg.author.id, msg.guild.id)
  }
}

// Give small amount of XP every amount of time
const msgXp = async (msg, minutes, amount) => {
  const rows = await knex.select('*').from('users').where({
    'user_id': msg.author.id,
    'server_id': msg.guild.id
  })
  if (rows.length > 0) {
    let entry = rows[0]
    if ((new Date() - new Date(entry.last_msg)) < (60000 * minutes)) return

    let xp = entry.message_xp + entry.quest_xp
    let newXp = xp + amount

    if (quadratic(xp) < quadratic(newXp)) {
      msg.channel.sendMessage(`${msg.author} increased to **Level ${quadratic(newXp)}!**`)
      console.log(`${bot.timestamp()} ${msg.member.nickname} grew to level ${quadratic(newXp)}`)
    }
    knex('users').where('id', entry.id).update({
      message_xp: entry.message_xp + amount,
      last_msg: new Date()
    })
  } else {
    console.log('User not found')
    addUser(msg.author.id, msg.guild.id)
  }
}

// !xp add @Mcnamara 400
const giveXp = async (msg, argument) => {
  let target = msg.mentions.users.first()
  if (!target) return msg.channel.sendMessage('User data not found.')
  const rows = await knex('users').select('*').where({
    'user_id': target.id,
    'server_id': msg.guild.id
  })
  if (rows.length > 0) {
    let entry = rows[0]
    let tempArr = msg.content.trim().split(' ')
    let xpAmount = parseInt(tempArr[tempArr.length - 1])
    let oldTotalXp = entry.quest_xp + entry.message_xp
    let newQuestXp = entry.quest_xp + xpAmount
    let newTotalXp = newQuestXp + entry.message_xp

    if (quadratic(oldTotalXp) < quadratic(newTotalXp)) {
      msg.channel.sendMessage(`${target} increased to **Level ${quadratic(newTotalXp)}!**`)
      console.log(`${bot.timestamp()} ${msg.guild.member(target).nickname} grew to level ${quadratic(newTotalXp)}`)
    }

    knex('users').where('id', entry.id).update({
      quest_xp: newQuestXp
    }).then(() => {
      msg.channel.sendMessage(`${xpAmount}xp given to ${msg.mentions.users.first().username}`).then((msg) => {
        setTimeout(() => {
          msg.delete()
        }, 3000)
      })
    })
  }
}

const lookUpID = (msg, argument) => {
  knex.select('*').from('users').where({
    'user_id': argument,
    'server_id': msg.guild.id
  }).then((rows) => {
    if (rows.length > 0) {
      try {
        let entry = rows[0]
        let target = bot.users.get(entry.user_id)
        console.log(target)
        let xp = entry.quest_xp + entry.message_xp
        let level = quadratic(xp)
        msg.channel.sendMessage(`${target.username}\n**Level ${level}** - **${xpRemainder(xp)}/${xpCost(level + 1) - xpCost(level)} XP**\nMessage XP: ${entry.message_xp}\nQuest XP: ${entry.quest_xp}`)
      } catch (err) {
        msg.channel.sendMessage(err)
      }
    } else {
      msg.channel.sendMessage('User not found.')
    }
  }).catch((err) => {
    console.log(err)
  })
}

const addUser = (userId, serverId/*, username */) => {
  // user_id,server_id,username
  console.log('Adding user ', userId)
  knex.select('id').from('users').where({'user_id': userId, 'server_id': serverId})
    .then((rows) => {
      if (rows.length < 1) {
        knex('users').insert({
          'user_id': userId,
          'server_id': serverId,
          'quest_xp': 0,
          'message_xp': 0,
          'last_msg': new Date()
        }).then(() => {
          console.log('User Added')
          return true
        })
      } else {
        console.log('Failed to forceadd ' + userId)
        return false
      }
    })
}

module.exports = {
  get: info,
  give: giveXp,
  msgXp: msgXp,
  addUser: addUser,
  lookUpID: lookUpID
}
