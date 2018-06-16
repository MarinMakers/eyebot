const bot = require('../bot')
const masterID = '127060142935113728'

bot.checkRole = async (msg, roleArr) => {
  var returnobj;
  var authorroles = [];
  var rolesStr = "";
    for (let i = roleArr.length - 1; i >= 0; i--) {
      if (await msg.guild.roles.find('name', roleArr[i]) != undefined) {
        let foundRole = msg.guild.roles.find('name', roleArr[i]);
        if (await msg.member.roles.has(foundRole.id)) {
          authorroles.push(" "+foundRole.name)
        }
      }
    }

    if(authorroles.length > 0) { 
      returnobj = true;
      rolesStr = rolesStr + authorroles + " ";
      await console.log(`${msg.author.username} has role(s)${rolesStr}`)
    }
    else { 
      returnobj = false;
      await console.log(`${msg.author.username} has none of the required roles`)
    }
    return returnobj;
  }