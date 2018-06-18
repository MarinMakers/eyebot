const knex = require('../utils/database')
const first = require('lodash.first')

const backup = async (msg) => {
  let guild = await msg.guild
  await lookupGuild(guild)
}
//looks for a db entry with identical snowflake, if not founds, calls add method
const lookupGuild = async (guild) => {
  await console.log(`Checking DB for Guild: ${guild.name}`)
  const dbGuilds = await knex
    .select('*')
    .from('backup_guilds')
    .where({
      'guild_snowflake': guild.id
    })
  const dbGuild = first(dbGuilds)
  if (dbGuild) { 
      await console.log(`Guild ${guild.name} exists in DB, continuing...`)
      var createdDataSet = await newDataSet(dbGuild.guild_id)
      await addGuildRoles(guild.roles, Number(createdDataSet)).catch((err) => { console.log(err); });
      await addGuildMembers(guild.members, Number(createdDataSet)).catch((err) => { console.log(err); });
      await addGuildChannels(guild.channels, Number(createdDataSet)).catch((err) => { console.log(err); });
    }  
  
  if (!dbGuild) {
    //guild doesnt exist in db so add it to db
    console.log(`Trying to add ${guild.name} to DB`)
    await addGuild(guild).catch((err) => { console.log(err); });
    await console.log(`Servername: ${guild.name} added to DB`)
    await lookupGuild(guild).catch((err) => { console.log(err); });
  } 
}

//adds a guild entry to the database
const addGuild = async (guild) => {
  await knex('backup_guilds').insert({
    'guild_snowflake': guild.id,
    'guild_name': guild.name
  })
}

const addGuildRoles = async (roles, dataSet) => {
  roles.forEach(async function (role) {
    console.log(` Role: ${role.name} added to DB`)
    await knex('backup_roles').insert({
      'role_dataset': dataSet,
      'role_snowflake': role.id,
      'role_name': role.name,
      'role_color': role.color,
      'role_permissions': role.permissions,
    })
  })
}

const addGuildMembers = async (members, dataSet) => {
  await members.forEach(async function (member) {
    var addedMember = await addGuildMember(member, dataSet).catch((err) => { console.log(err); });
    await addGuildMemberRoles(Number(addedMember), member, dataSet)
    })
}

const addGuildMember = async (member, dataSet) => {
  await console.log(`Member ${member.user.username} saved to DB`)
  return await knex('backup_members').insert({
    'member_dataset': dataSet,
    'member_snowflake': member.user.id,
    'member_username': member.user.username,
    'member_tag': member.user.tag,
    'member_nickname': member.nickname
  })
  .returning('member_id')
}

const addGuildMemberRoles = async (memberId, member, dataSet) => {
  await member.roles.forEach(async function (role) {
    const memberRoles = await knex
      .select('role_id')
      .from('backup_roles')
      .where({
        'role_dataset': dataSet,
        'role_snowflake': role.id
      })
    const memberRole = first(memberRoles)
    await addGuildMemberRole(memberId, memberRole, dataSet)
  })
}

const addGuildMemberRole = async (memberId, memberRole, dataSet) => {
    await knex('backup_memberroles').insert({
      'memberrole_dataset': dataSet,
      'user_id': memberId,
      'role_id': memberRole.role_id
    })
    await console.log(`Role membership added for ${memberId}`)
}

const addGuildChannels = async (channels, dataSet) => {
  await channels.array().forEach(async function (channel) {
    await addGuildChannel(channel, dataSet)
 })
}

const addGuildChannel = async (channel, dataSet) => {
  var parent = 0
  if(await channel.parentID != undefined) {
    var parentChannel = await knex
      .select('channel_id')
      .from('backup_channels')
      .where({
        'channel_snowflake': channel.parentID,
        'channel_dataset': dataSet
    })
    parent = first(parentChannel)
    parent = parent.channel_id
  }
  else {
    parent = 0
  }

  await console.log(`${parent} xxx ${channel.parentID}`)
  await knex('backup_channels').insert({
    'channel_dataset': dataSet,
    'channel_parentid': parent,
    'channel_snowflake': channel.id,
    'channel_topic': channel.topic,
    'channel_nsfw': channel.nsfw,
    'channel_position': channel.position,
    'channel_name': channel.name,
    'channel_type': channel.type
  })
}

const addGuildChannelOverrides = async (channel, dataSet) => {


  
}

const addGuildChannelOverride = async (channel, dataSet) => {


  
}

const newDataSet = async (guild) => {
  return await knex('backup_datasets').insert({
    'dataset_guild': guild.id
  })
  .returning('dataset_id')
}

module.exports =  backup