const commands = require('../commands')
const { prefix } = require('../constants')

module.exports = {
  description: 'Messages user list of commands',
  process: msg => {
    let commandList = 'Available Commands:```'
    for (const cmd in commands) {
      if (!commands[cmd].discrete) {
        let command = prefix + cmd
        let usage = commands[cmd].usage
        if (usage) {
          command += ' ' + usage
        }
        let description = commands[cmd].description
        if (description) {
          command += '\n\t' + description
        }
        commandList += command + '\n'
      }
    }
    commandList += '```'
    msg.author.send(commandList)
  }
}
