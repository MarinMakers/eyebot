const bot = require('../bot')
const masterID = '127060142935113728'

bot.checkRole = async (msg, roleArr) => {
  var hasRole;
  var authorRoles = [];
  for (let i = roleArr.length - 1; i >= 0; i--) {
    if (await msg.guild.roles.find('name', roleArr[i]) != undefined) {
      let foundRole = await msg.guild.roles.find('name', roleArr[i]);
      if (await msg.member.roles.has(foundRole.id)) {
        authorRoles.push(foundRole.name)
      }
    }
  }

  if(authorRoles.length > 0) { 
    hasRole = true;
    authorRoles = authorRoles.join(", ")
    await console.log(`${msg.author.username} has role(s) ${authorRoles}`)
  }
  else { 
    hasRole = false;
    await console.log(`${msg.author.username} has none of the required roles`)
  }
  return hasRole;
}