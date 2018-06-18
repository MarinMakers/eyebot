const backup = async (msg) => {
  //server members
  let guild = await msg.guild;
  let channels = await msg.guild.channels;
  let roles = await msg.guild.roles;
  let members = await msg.guild.members;
  console.log(`Servername: ${guild.name} ID: ${guild.id}`);
  await listChannels(channels);  
  await listGuildRoles(roles); 
  await listMembers(members);

}

const listChannels = async (channels) => {
  channels.forEach(async function (channel) {
    console.log(`Channel ${channel.name} ID: ${channel.id} Type: ${channel.type}`); 
    channel.permissionOverwrites.forEach(async function (item) {
      console.log(` Permission Overwrite: \n  ID: ${item.id} \n  Type: ${item.type} \n  deny: ${item.deny} \n  allow: ${item.allow}`);
    })
  })
}

const listMembers = async (members) => {
  members.forEach(async function (member) {
    console.log(`Member ${member.user.username} has id ${member.user.id} has tag ${member.user.tag} has nickname ${member.nickname}`);
    member.roles.forEach(async function (role) {
      console.log(` Role: ${role.name} ID: ${role.id}`);
    })
  })
}

const listGuildRoles = async (roles) => {
  roles.forEach(async function (role) {
  console.log(`Guild Role: ${role.name} Permissions: ${role.permissions}`);
  })
}

module.exports = backup