'use strict'

const { createServer } = require('http')
const crypto = require('crypto')
const qs = require('querystring')
const path = require('path')
const mudb = require('mudb')
const { body, validate, authorize } = require('./util')

const { PORT, HOST, STORAGE, NODE_ENV } = process.env
const subscribersJSON = path.resolve(STORAGE || process.cwd(), './subscribers.json')

let db

run()

async function run () {
  db = await mudb.open(subscribersJSON)
}

async function actions (req) {
  const { method } = req
  if (method === 'POST') {
    const email = await body(req)
    validate(email)
    // Add if non-existent email
    if (!db.get({ email }).length) {
      db.put({ email, _id: crypto.randomBytes(3 * 4).toString('base64') }).save()
    }
    return email
  } else if (method === 'DELETE') {
    db.del({ _id: req.url.substr(1) }).save()
    return
  } else if (method === 'GET') {
    authorize(req)
    if (qs.parse(req.url.substr(2)).verbose !== undefined) {
      return JSON.stringify(db.data)
    }
    return db.data.map(row => row.email).join('\n')
  }
  throw new Error('Method Not Allowed')
}

const server = createServer(async (req, res) => {
  // Credentials access keys
  res.setHeader('Access-Control-Allow-Headers', 'Authorization')
  res.setHeader('Access-Control-Allow-Credentials', true)

  // REST Methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')

  try {
    res.end(await actions(req))
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
