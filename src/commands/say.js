module.exports = {
  description: 'Make the bot say something',
  usage: '<string>',
  process: async (msg, argument) => {
    try {
      console.log(`${msg.author.username} said this through the bot:\n${msg.content}`)
      await msg.delete()
    } catch (err) { console.log(err) }
    await msg.channel.send(argument)
  }
}
