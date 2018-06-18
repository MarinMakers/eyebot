const checkRole = async (msg, roleArr) => {
  var authorRoles = []
  await Promise.all(roleArr.map(async role => {
    let targetRole = await msg.guild.roles.find('name', role)
    if (targetRole) {
      if (await msg.member.roles.has(targetRole.id)) authorRoles.push(targetRole.name)
    }
  }))
  const hasRole = (authorRoles.length > 0)
  console.log(hasRole
    ? `${msg.author.username} has role(s) ${authorRoles.join(', ')}`
    : `${msg.author.username} has none of the required roles`)

  return hasRole
}

module.exports = checkRole
