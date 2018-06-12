const commands = {
  'ping': require('./ping'),
  'help': require('./help'),
  'say': require('./say'),
  'reboot': require('./reboot'),
  'enlist': require('./enlist'),
  'propaganda': require('./propaganda'),
  'info': require('./info'),
  'level': require('./level'),
  'xp': require('./xp'),
  'xplu': require('./xplu'),
  'revoke': require('./revoke'),
  'forceadd': require('./forceadd')
}

module.exports = commands
