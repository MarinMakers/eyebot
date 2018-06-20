const commands = {
  'lint': require('./lint'), //privileged only
  'xp': require('./xp'), //privileged only
  //'revoke': require('./revoke'), //privileged, not implemented atm
  'reboot': require('./reboot'), //privileged only
  'enlist': require('./enlist'), // privileged only
  'help': require('./help'), //for all users \/
  'xplu': require('./xplu'),
  'propaganda': require('./propaganda'),
  'info': require('./info'),
  'level': require('./level'),
  'map': require('./map'),
  'ping': require('./ping'),
  'whoishere': require('./whoishere'),
}

module.exports = commands