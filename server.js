'use strict'

const { createServer } = require('http')

const { PORT, HOST, NODE_ENV } = process.env

let server

run()

module.exports = { server }

async function run () {
  server = createServer((req, res) => {
    // Credentials access keys
    res.setHeader('Access-Control-Allow-Headers', 'Authorization')
    res.setHeader('Access-Control-Allow-Credentials', true)

    // REST Methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')

    try {
      res.end(req.method)
    } catch (err) {
      // Unexpected Error
      res.writeHead(500).end('Internal Server Error')
      process.stderr.write(err + '\n')
    }
  })

  server.listen(PORT, HOST, () => {
    if (NODE_ENV !== 'test') {
      process.stdout.write(`Server listening on port ${server.address().port}\n`)
    }
  })
}
