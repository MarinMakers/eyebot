const bot = require('../bot')

bot.checkRole = async (msg, roleArr) => {
  var authorRoles = []
  roleArr.forEach(async role => {
    if (await msg.guild.roles.find('name', role)) {
      let foundRole = await msg.guild.roles.find('name', role)
      if (await msg.member.roles.has(foundRole.id)) authorRoles.push(foundRole.name)
    }
  })

  const hasRole = (authorRoles.length > 0)
  console.log(hasRole
    ? `${msg.author.username} has role(s) ${authorRoles.join(', ')}`
    : `${msg.author.username} has none of the required roles`)

  return hasRole
}
