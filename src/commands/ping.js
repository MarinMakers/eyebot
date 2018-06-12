module.exports = {
  description: 'Check if the bot is online.',
  process: (msg, argument) => {
    msg.channel.send(msg.author + ' pong!')
    console.log(`${msg.author.username} pinged the bot`)
  }
}
