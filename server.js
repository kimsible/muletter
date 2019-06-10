'use strict'

const { createServer } = require('http')
const path = require('path')
const mudb = require('mudb')
const { validate, authorize } = require('./util')

const { PORT, HOST, STORAGE, NODE_ENV } = process.env
const subscribersJSON = path.resolve(STORAGE || process.cwd(), './subscribers.json')

let db

run()

async function run () {
  db = await mudb.open(subscribersJSON)
}

function actions (req) {
  const { method } = req
  if (method === 'POST') {
    const email = validate(req)
    // Add if non-existent email
    if (!db.get(email).length) {
      db.put(email).save()
    }
    return email
  } else if (method === 'DELETE') {
    authorize(req)
    const email = validate(req)
    db.del(email).save()
    return email
  } else if (method === 'GET') {
    authorize(req)
    return db.data.join('\n')
  }
  throw new Error('Method Not Allowed')
}

const server = createServer((req, res) => {
  // Credentials access keys
  res.setHeader('Access-Control-Allow-Headers', 'Authorization')
  res.setHeader('Access-Control-Allow-Credentials', true)

  // REST Methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')

  try {
    res.end(actions(req))
  } catch (err) {
    if (/^Conflict/.test(err.message)) {
      res.writeHead(409).end()
    } else if (/^Method/.test(err.message)) {
      res.writeHead(405).end()
    } else if (/^Unauthorized/.test(err.message)) {
      res.writeHead(401).end()
    } else {
      // Unexpected Error
      res.writeHead(500).end()
      NODE_ENV !== 'test' && process.stderr.write(err + '\n')
    }
  }
})

server.listen(PORT, HOST, () => {
  NODE_ENV !== 'test' && process.stdout.write(`Server listening on port ${server.address().port}\n`)
})

module.exports = server
