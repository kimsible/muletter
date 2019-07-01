'use strict'

const { createServer } = require('http')
const crypto = require('crypto')
const url = require('url')
const path = require('path')
const mudb = require('mudb')
const nodemailer = require('nodemailer')
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
    const { query: { verbose } } = url.parse(req.url, true)
    if (verbose !== undefined) {
      return JSON.stringify(db.data)
    }
    return db.data.map(row => row.email).join('\n')
  } else if (method === 'PUT') {
    authorize(req)
    const { smtp, message, unsubscribe } = JSON.parse(await body(req))
    const transport = nodemailer.createTransport(smtp)
    try {
      await transport.verify()
    } catch (err) {
      return err.message
    }
    const errors = []
    const list = db.data.map(item => transport.sendMail({
      ...message,
      to: item.email,
      list: {
        unsubscribe: `${unsubscribe || message.from}?subject=unsubscribe-${item._id}`
      }
    }).catch(err => { errors.push(err.message) }))
    await Promise.all(list)
    return errors.join('\n')
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
