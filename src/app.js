// HTTP server stuff
require('dotenv').config()
const express = require('express')
const bot = require('./bot')
bot.login(process.env.DISCORD_TOKEN)

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
