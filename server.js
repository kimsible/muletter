'use strict'

const { createServer } = require('http')
const { validate, authorize } = require('./util')

const { PORT, HOST, NODE_ENV } = process.env

let server

run()

module.exports = server

async function run () {
  server = createServer((req, res) => {
    const actions = {
      POST: req => {
        const email = validate(req)
        return email
      },

      DELETE: req => {
        authorize(req)
        const email = validate(req)
        return email
      },

      GET: req => {
        authorize(req)
        return ''
      }
    }

    // Credentials access keys
    res.setHeader('Access-Control-Allow-Headers', 'Authorization')
    res.setHeader('Access-Control-Allow-Credentials', true)

    // REST Methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')

    const { method } = req
    try {
      if (!actions[method]) {
        res.writeHead(405).end('Method Not Allowed')
        return
      }
      res.end(actions[method](req))
    } catch (err) {
      if (/^Conflict/.test(err.message)) {
        res.writeHead(409).end(err.message)
      } else if (/^Unauthorized/.test(err.message)) {
        res.writeHead(401).end(err.message)
      } else {
        // Unexpected Error
        res.writeHead(500).end('Internal Server Error')
        process.stderr.write(err + '\n')
      }
    }
  })

  server.listen(PORT, HOST, () => {
    if (NODE_ENV !== 'test') {
      process.stdout.write(`Server listening on port ${server.address().port}\n`)
    }
  })
}
