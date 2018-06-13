const level = require('../helpers/level')

module.exports = {
  process: async (msg, argument) => {
    await level.lookUpID(msg, argument)
  }
}
