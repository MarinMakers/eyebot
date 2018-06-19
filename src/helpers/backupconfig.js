const knex = require('../utils/database')
const first = require('lodash.first')

const backup = async (msg) => {
  let guild = await msg.guild
  let mess = await msg
  await lookupGuild(guild, mess)
}
//looks for a db entry with identical snowflake, if not founds, calls add method
const lookupGuild = async (guild, mess) => {
  await console.log(` Checking DB for Guild: ${guild.name}`)
  const dbGuilds = await knex
    .select('*')
    .from('backup_guilds')
    .where({
      'guild_snowflake': guild.id
    })
  const dbGuild = first(dbGuilds)
  if (dbGuild) { 
      await console.log(` Guild ${guild.name} exists in DB, continuing...`)
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
    console.log(`  Role: ${role.name} added to DB`)
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

const addGuildChannels = async (channels, dataSet) => {
  var channelArray = channels.array()
  
  channelArray = channelArray.slice(0);
  channelArray.sort(function(a,b) {
    return a.parentID - b.parentID;
  });
  for(var x = 0; x < channelArray.length; x++) {
    if(channelArray[x].parentID === undefined || channelArray[x].parentID === null) {
      const channelData = {
        'dataset': dataSet,
        'parentid': 0,
        'nsfw': channelArray[x].nsfw,
        'position': channelArray[x].position,
        'topic': channelArray[x].topic,
        'type': channelArray[x].type,
        'snowflake': channelArray[x].id,
        'name': channelArray[x].name,
      }
      await addGuildChannel(channelData, dataSet)
    }
    else {
      const channelData = {
        'dataset': dataSet,
        'parentid': (await getChannelParent(channelArray[x].parentID, dataSet))['channel_id'],
        'nsfw': channelArray[x].nsfw,
        'position': channelArray[x].position,
        'topic': channelArray[x].topic,
        'type': channelArray[x].type,
        'snowflake': channelArray[x].id,
        'name': channelArray[x].name,
      }
      await addGuildChannel(channelData, dataSet)
    }
  }
  getGuildChannelOverwrites(channels, dataSet)
}

const getMemberIds = async(dataSet) => {
  return await knex
    .select('member_id', 'member_snowflake')
    .from('backup_members')
    .where({'member_dataset': dataSet})
    .returning('member_id', 'member_snowflake')
}

const getRoleIds = async(dataSet) => {
  return await knex
    .select('role_id', 'role_snowflake')
    .from('backup_roles')
    .where({'role_dataset': dataSet})
    .returning('role_id', 'role_snowflake')
}

const getChannelIds = async(dataSet) => {
  return await knex
    .select('channel_id', 'channel_snowflake')
    .from('backup_channels')
    .where({'channel_dataset': dataSet})
    .returning('channel_id', 'channel_snowflake')
}



const getGuildChannelOverwrites = async (channels, dataSet) => {
  const memberIds = await getMemberIds(dataSet)
  const roleIds = await getRoleIds(dataSet)
  const channelIds = await getChannelIds(dataSet)
  let permissionOverwrite = {
    'channel': 0,
    'dataset': 0,
    'target': 0,
    'deny': 0,
    'allow': 0,
    'type': ""
  }
  
  await channels.forEach(async function (channel) {
    await memberIds.forEach(async function (memberId) {
      const overwrite = await getGuildChannelOverwrite(channel, memberId.member_snowflake)
      if(overwrite != undefined) {
        permissionOverwrite = {
          'channel': (channelIds.filter(function(obj) { return obj.channel_snowflake == channel.id;}))[0].channel_id,
          'dataset': dataSet,
          'target': memberId.member_id,
          'deny': overwrite.deny,
          'allow': overwrite.allow,
          'type': overwrite.type,
        }
        await saveGuildChannelOverwrite(permissionOverwrite)
      }
    })
    await roleIds.forEach(async function (roleId) {
      const overwrite = await getGuildChannelOverwrite(channel, roleId.role_snowflake)
      if(overwrite != undefined) {
        permissionOverwrite = {
          'channel': (channelIds.filter(function(obj) { return obj.channel_snowflake == channel.id;}))[0].channel_id,
          'dataset': dataSet,
          'target': roleId.role_id,
          'deny': overwrite.deny,
          'allow': overwrite.allow,
          'type': overwrite.type,
        }
        await saveGuildChannelOverwrite(permissionOverwrite)
      }
    })
  })
 console.log("  All permission overwrites saved to DB")
}

const getGuildChannelOverwrite = async (channel, snowflake) => {
  return await channel.permissionOverwrites.get(snowflake)
}

const saveGuildChannelOverwrite = async (permissionOverwrite) => {
  await knex('backup_overwrites')
  .insert({
    'overwrite_dataset': permissionOverwrite.dataset,
    'overwrite_targetid': permissionOverwrite.target,
    'overwrite_channelid': permissionOverwrite.channel,
    'overwrite_type': permissionOverwrite.type,
    'overwrite_allow': permissionOverwrite.allow,
    'overwrite_deny': permissionOverwrite.deny
  })
}

const getChannelParent = async(parentID, dataSet) => {
  return await knex
    .select('channel_id')
    .from('backup_channels')
    .where({
      'channel_dataset': dataSet,
      'channel_snowflake': parentID
    })
    .first('channel_id')
}

const addGuildChannel = async (channelData, dataSet) => {
  console.log(`  Channel ${channelData.name} saved to DB`)
  await knex('backup_channels')
    .insert({
      'channel_dataset': dataSet,
      'channel_parentid': 0,
      'channel_nsfw': channelData.nsfw,
      'channel_position': channelData.position,
      'channel_topic': channelData.topic,
      'channel_type': channelData.type,
      'channel_snowflake': channelData.snowflake,
      'channel_name': channelData.name
    })
}

const addGuildMember = async (member, dataSet) => {
  await console.log(`  Member ${member.user.username} saved to DB`)
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
    await addGuildMemberRole(member, memberId, memberRole, dataSet)
  })
}

const addGuildMemberRole = async (member, memberId, memberRole, dataSet) => {
    await knex('backup_memberroles').insert({
      'memberrole_dataset': dataSet,
      'user_id': memberId,
      'role_id': memberRole.role_id
    })
    await console.log(`  Role membership added for ${member.user.username}`)
}

const newDataSet = async (guild) => {
  return await knex('backup_datasets').insert({
    'dataset_guild': guild.id
  })
  .returning('dataset_id')
}

module.exports = backup