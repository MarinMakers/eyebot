const app = require('./app')
const PORT = process.env.PORT || 3005

const server = app.listen(PORT, () => {
  console.log('Ready on ' + PORT)
})

process.on('SIGINT', () => {
  console.log('Caught SIGINT, bye...')
  server.close()
  process.exit(0)
})
