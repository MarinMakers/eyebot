module.exports = {
  description: 'Make the bot say something',
  usage: '<string>',
  process: async (msg, argument) => {
    await msg.channel.send(argument)
  }
}
