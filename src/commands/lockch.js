const { checkRole } = require('../helpers')
const path = require('path')

module.exports = {
    description: 'Lock the Text channel, so Initiate cant write or add reaction',
    usage: '$lockch',
    process: async msg => {
        if(await checkRole(msg, ['Elder', 'Star Paladin', 'Paladin Commander', 'Paladin Captain', 'Paladin'])){
            const imagePath = path.join(__dirname, '../../public/images/Silence-BoS.png')
            await msg.channel.send({file: imagePath})

            var initiateRole = msg.guild.roles.find('name', 'Initiate')

            msg.channel.overwritePermissions(initiateRole, {SEND_MESSAGES: false, ADD_REACTIONS: false})

            console.log("'"+msg.channel.name+"' Locked.")
        }
    }
}
