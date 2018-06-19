module.exports = {
  description: 'Check how many users have which status.',
  process: async msg => {
    const members = await msg.guild.members.array()

    const status = {
      'online': 0,
      'offline': 0,
      'idle': 0,
      'dnd': 0
    }
    // count the number of users with the specific status
    members.forEach(member => { status[member.presence.status]++ })

    const outputArr = []
    // select the correct string (singular/plural) for output and put the strings together
    if (status['online']) {
      outputArr.push(`${status['online']} ${status['online'] > 1 ? 'brothers are here' : 'brother is here'}`)
    }
    if (status['offline']) {
      outputArr.push(`${status['offline']} ${status['offline'] > 1 ? 'brothers are in their bunk' : 'brother is in his bunk'}`)
    }
    if (status['idle']) {
      outputArr.push(`${status['idle']} ${status['idle'] > 1 ? 'brothers are awaiting commands' : 'brother is awaiting commands'}`)
    }
    if (status['dnd']) {
      outputArr.push(`${status['dnd']} ${status['dnd'] > 1 ? 'brothers are preoccupied' : 'brother is preoccupied'}`)
    }

    console.log(`${msg.author.username} looked around`)
    await msg.channel.send(outputArr.join(', '))
  }
}
