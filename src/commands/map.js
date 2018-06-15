const path = require('path')

module.exports = {
  description: 'Display the latest map we have for FO76.',
  process: async msg => {
    const mapImagePath = path.join(__dirname, '../../public/images/wvmap.png')
    return msg.channel.send({ files: [mapImagePath] })
  }
}
