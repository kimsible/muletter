'use strict'

const test = require('ava')
const { request, createServer } = require('http')

const { body, validate, authorize } = require('./util')

test('util/body', bodyTest, 'my-body', 'my-body')

async function bodyTest (t, input, expected) {
  const server = createServer(async (req, res) => {
    try {
      res.end(await body(req))
    } catch (err) {
      res.end(err.contructor.name)
    }
  }).listen()

  const res = await new Promise((resolve, reject) => {
    const req = request({ port: server.address().port, method: 'POST' }, resolve)
    req.on('error', reject)
    req.write(input)
    req.end()
  })

  t.deepEqual(await body(res), expected)
}

test('util/validate - valid email', macroValidate, { url: '/email@provider.io' }, 'email@provider.io')
test('util/validate - missing @', macroValidate, { url: '/emailprovider' }, Error)
test('util/validate - wrong extension', macroValidate, { url: '/email@provider.c' }, Error)

function macroValidate (t, input, expected) {
  if (typeof expected !== 'string') {
    t.throws(() => { validate(input) }, expected)
  } else {
    t.is(validate(input), expected)
  }
}

process.env.KEY = '123'

test('util/authorize - right key', macroAuthorize, {
  headers: {
    authorization: 'Basic 123'
  }
}, process.env.KEY)

test('util/authorize - bad header', macroAuthorize, {
  headers: {
    authorization: 'OAuth 123'
  }
}, Error)

test('util/authorize - wrong key', macroAuthorize, {
  headers: {
    authorization: 'Basic 42'
  }
}, Error)

function macroAuthorize (t, input, expected) {
  if (typeof expected !== 'string') {
    t.throws(() => { authorize(input) }, expected)
  } else {
    t.is(authorize(input), expected)
  }
}
