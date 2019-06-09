'use strict'

const URL = require('url').parse(process.env.URL)

const options = {
  ...URL,
  path: '/',
  headers: {
    'Authorization': `Basic ${process.env.KEY}`
  }
}

require(URL.protocol.replace(':', '')).get(options, res => {
  let buffer = ''
  res.on('data', chunk => {
    buffer += chunk
  })
  res.on('error', err => {
    process.stderr.write(err + '\n')
  })
  res.on('end', () => {
    process.stdout.write(buffer + '\n')
  })
}).end()
