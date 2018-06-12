module.exports = {
  description: 'Make the bot say something',
  usage: '<string>',
  process: (msg, argument) => {
    msg.channel.send(argument)
  }
}
