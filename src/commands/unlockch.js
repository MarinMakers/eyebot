const { checkRole } = require('../helpers')
const path = require('path')

module.exports = {
    description: 'Unlock the Text channel, so Initiate can write or add reaction',
    usage: '$unlock',
    process: async msg => {
        if(await checkRole(msg, ['Elder', 'Star Paladin', 'Paladin Commander', 'Paladin Captain', 'Paladin', 'Head Scribe'])){

            msg.channel.send("**Radio Silence is over!**\nFollow the previous orders!")

            var initiateRole = msg.guild.roles.find('name', 'Initiate')

            msg.channel.overwritePermissions(initiateRole, {SEND_MESSAGES: true, ADD_REACTIONS: true})

            console.log("'"+msg.channel.name+"' Unlocked.")
        }
    }
}