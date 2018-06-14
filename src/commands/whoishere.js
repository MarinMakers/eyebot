const bot = require('../bot')

module.exports = {
  description: 'Check how many users have which status.',
  process: async msg => {
    var members = await msg.guild.members.array();
    var output ="";
    // 0 = online, 1 = offline, 2 = idle, 3=dnd
    var status = [[0,""," brother is here, ", " brothers are here, "],
        [0,""," brother is in his bunk, ", " are in their bunk, "],
        [0,""," brother is awaiting commands, ", " are awaiting commands, "],
        [0,""," brother is preoccupied", " brothers are preoccupied"]];
    // count the number of users with the specific status
    for(member = 0; member < members.length; member++) {
        if(members[member].presence.status=="online") {status[0][0]++}
        if(members[member].presence.status=="offline") {status[1][0]++}
        if(members[member].presence.status=="idle") {status[2][0]++}
        if(members[member].presence.status=="dnd") {status[3][0]++}
    }
    // select the correct string (singular/plural) for output and put the strings together
    var debugcount = 0;
    status.forEach(function(state) {
        if(state[0] == 0) { state[0] = "none of your"; state[1] = state[3] }
        if(state[0] == 1) { state[1] = state[2] }
        if(state[0] > 1) { state[1] = state[3] }
        output = output + state[0] + state[1];
        output.charAt(0).toUpperCase();
    })

    await msg.channel.send(output)
    await console.log(`${msg.author.username} looked around`)
  }
}
