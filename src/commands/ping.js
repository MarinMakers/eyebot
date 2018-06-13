module.exports = {
  description: 'Check if the bot is online.',
  process: async msg => {
    await msg.channel.send(msg.author + ' pong!')
    await console.log(`${msg.author.username} pinged the bot`)
  }
}
