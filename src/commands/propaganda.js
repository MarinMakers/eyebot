const fs = require('fs')
const sample = require('lodash.sample')
const path = require('path')

module.exports = {
  description: 'Display a piece of BoS propaganda.',
  process: async msg => {
    const imagesPath = path.join(__dirname, '../../public/images/propaganda')
    fs.readdir(imagesPath, (err, files) => {
      if (err) return msg.channel.send('No assets found.')
      let validFiles = files.filter(file => !file.startsWith('.'))
      let filepath = path.join(imagesPath, sample(validFiles))
      return msg.channel.send({ files: [filepath] })
    })
  }
}
