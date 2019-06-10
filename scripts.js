'use strict'

const { randomBytes } = require('crypto')
const { parse } = require('url')

if (process.argv.find(i => i === 'key')) {
  process.stdout.write(`KEY : ${randomBytes(20).toString('base64')}\n`)
}

if (process.argv.find(i => i === 'export')) {
  const url = parse(process.env.URL)
  const protocol = url.protocol.match(/^(https?)/)[1]
  const headers = { authorization: `Basic ${process.env.KEY}` }
  const req = require(protocol).get({ ...url, headers })
  req.on('error', err => { process.stderr.write(err + '\n') })
  req.once('response', res => {
    res.statusCode === 401 && process.stderr.write(`Unauthorized Error : wrong KEY\n`)
    res.statusCode === 500 && process.stderr.write(`Internal Server Error\n`)
    let buffer = ''
    res.setEncoding('utf8')
    res.on('data', chunk => { buffer += chunk })
    res.on('end', () => { process.stdin.write(buffer + '\n') })
  })
  req.end()
}
