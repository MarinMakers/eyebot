const level = require('../helpers/level')

module.exports = {
  process: (msg, argument) => {
    level.lookUpID(msg, argument)
  }
}
