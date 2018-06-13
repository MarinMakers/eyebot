const commands = {
  'ping': Object.assign({}, require('./ping')),
  'help': Object.assign({}, require('./help')),
  'say': Object.assign({}, require('./say')),
  'reboot': Object.assign({}, require('./reboot')),
  'enlist': Object.assign({}, require('./enlist')),
  'propaganda': Object.assign({}, require('./propaganda')),
  'info': Object.assign({}, require('./info')),
  'level': Object.assign({}, require('./level')),
  'xp': Object.assign({}, require('./xp')),
  'xplu': Object.assign({}, require('./xplu')),
  'revoke': Object.assign({}, require('./revoke')),
  'forceadd': Object.assign({}, require('./forceadd'))
}

module.exports = commands
