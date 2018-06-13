const level = require('../helpers/level')

module.exports = {
  description: 'View your level',
  process: async msg => {
    if (msg.content.split(' ').length === 1) {
      await level.get(msg)
    }
  }
}
