'use strict'

const { randomBytes } = require('crypto')

process.stdout.write(`KEY : ${randomBytes(20).toString('base64')}\n`)
