const { backup } = require('../helpers')

const restore = async (msg) => {
    
    //DB data
    let db_guild; //ask from db
    let db_channels;
    let db_ch_roles;
    let db_s_roles;
    let db_members;
    //end DB data

    //rn queired data
    let channels = await listChannels(await msg.guild.channels)
    let roles = await listGuildRoles(await msg.guild.roles)
    //end rn quiered data

    await restoreRoles(msg, db_s_roles, roles)

  
}

/*roles obj
[{
    id: msg.guild.id,
    deny: 0,
    allow: 1024
}]
*/

const restoreRoles = async (db_s_roles, roles, msg) => {

    db_s_roles.forEach(async function (role_restore) {
        
        if (`${role_restore.name}` == roles.filter(x => x.name == `${role_restore.name}`).name) {

            if (`${role_restore.permissions}` == roles.filter(x => x.name == `${role_restore.name}`).permissions) {
                console.log(`Role - No action taken - name: ${role_restore.name}`)
            }
            else {
                //rewrite permissions
            }
        }
        else {
            msg.guild.createRole([{
                name: `${roles.name}`,
                color: `${roles.color}`,
                hoist: `${roles.hoist}`,
                position: `${roles.position}`,
                permissions: `${roles.permissions}`,
                mentionable: `${roles.mentionable}`
            }],"restoring")
            .then(role => console.log(`Role - created - name: ${role.name}`))
        }
        
    })

}

const restoreChannels = async (msg, db_channels, db_ch_roles, channels) => {

    var i = 0;
    db_channels.forEach(async function (channel) {
        if (`${channel.name}` == channels.filter(x => x.name == `${channel.name}`).name) {
            if (`${channel.permissions}` == channels.filter(x => x.name == `${channel.name}`).permissions) {
                console.log(`Channel - No action taken - name: ${channel.name}`)
            }
            else {
                //rewrite permissions
            }
        }
        else {
            msg.guild.createChannel(`${channel.name}`, `${channel.type}`, `[{${db_ch_roles[i]}}]`)
            i++;
        }
        
    })
}

const listGuildRoles = async (roles) => {
    roles.forEach(async function (role) {
    //console.log(`Guild Role: ${role.name} Permissions: ${role.permissions} ID: ${role.id}`);
    })
  }

const listChannels = async (channels) => {
    channels.forEach(async function (channel) {
      //console.log(`Channel ${channel.name} ID: ${channel.id} Type: ${channel.type}`); 
      //console.log("==================")
      channel.permissionOverwrites.forEach(async function (item) {
        //console.log(` Permission Overwrite: \n  ID: ${item.id} \n  Type: ${item.type} \n  deny: ${item.deny} \n  allow: ${item.allow}`);
      })
    })
  }




module.exports = restore