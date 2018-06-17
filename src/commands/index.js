const commands = {
  'ping': require('./ping'),
  'whoishere': require('./whoishere'),
  'help': require('./help'),
  'reboot': require('./reboot'),
  'enlist': require('./enlist'),
  'propaganda': require('./propaganda'),
  'info': require('./info'),
  'level': require('./level'),
  'xp': require('./xp'),
  'xplu': require('./xplu'),
  'revoke': require('./revoke'),
  'forceadd': require('./forceadd'),
  'map': require('./map'),
  'lint': require('./lint')
}

module.exports = commands
