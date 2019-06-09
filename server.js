'use strict'

const { createServer } = require('http')
const { resolve } = require('path')
const mudb = require('mudb')
const { validate, authorize } = require('./util')

const { PORT, HOST, STORAGE, NODE_ENV } = process.env
const subscribersJSON = resolve(STORAGE || process.cwd(), './subscribers.json')

let db

run()

async function run () {
  db = await mudb.open(subscribersJSON)
}

const server = createServer(async (req, res) => {
  const actions = {
    POST: async req => {
      const email = validate(req)
      // Add if non-existent email
      if (!db.get(email).length) {
        await db.put(email).save()
      }
      return email
    },

    DELETE: async req => {
      authorize(req)
      const email = validate(req)
      await db.del(email).save()
      return email
    },

    GET: async req => {
      authorize(req)
      return db.data.join('\n')
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
    res.end(await actions[method](req))
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

module.exports = server
