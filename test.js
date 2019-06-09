'use strict'

const test = require('ava')
const delay = require('delay')

process.env.KEY = '123'
process.env.STORAGE = '/tmp'

const { validate, authorize } = require('./util')
const server = require('./server')

test('validate - valid email', macroValidate, { url: '/email@provider.io' }, 'email@provider.io')
test('validate - missing @', macroValidate, { url: '/emailprovider' }, Error)
test('validate - wrong extension', macroValidate, { url: '/email@provider.c' }, Error)

function macroValidate (t, input, expected) {
  if (typeof expected !== 'string') {
    t.throws(() => { validate(input) }, expected)
  } else {
    t.is(validate(input), expected)
  }
}

test('authorize - right key', macroAuthorize, {
  headers: {
    authorization: 'Basic 123'
  }
}, process.env.KEY)

test('authorize - bad header', macroAuthorize, {
  headers: {
    authorization: 'OAuth 123'
  }
}, Error)

test('authorize - wrong key', macroAuthorize, {
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

test('server - Method Not Allowed', async t => {
  const res = await request({ method: 'PUT', path: '/email@provider' })
  t.is(res.statusCode, 405)
})

test('server - POST 409 Error', async t => {
  const res = await request({ method: 'POST', path: '/email@provider' })
  t.is(res.statusCode, 409)
})

test('server - POST 200 OK', async t => {
  const res = await request({ method: 'POST', path: '/email@provider.com' })
  t.is(res.statusCode, 200)
})

test('server - DELETE 401 Error', async t => {
  const res = await request({
    method: 'DELETE',
    path: '/email@provider.com',
    headers: {
      authorization: 'Basic abc'
    }
  })
  t.is(res.statusCode, 401)
})

test('server - DELETE 409 Error', async t => {
  const res = await request({
    method: 'DELETE',
    path: '/email@provider',
    headers: {
      authorization: 'Basic 123'
    }
  })
  t.is(res.statusCode, 409)
})

test('server - DELETE 200 OK', async t => {
  const res = await request({
    method: 'DELETE',
    path: '/email@provider.com',
    headers: {
      authorization: 'Basic 123'
    }
  })
  t.is(res.statusCode, 200)
})

test('server - GET 401 Error', async t => {
  const res = await request({
    method: 'GET',
    path: '/',
    headers: {
      authorization: 'Basic abc'
    }
  })
  t.is(res.statusCode, 401)
})

test('server - GET 200 Ok', async t => {
  const res = await request({
    method: 'GET',
    path: '/',
    headers: {
      authorization: 'Basic 123'
    }
  })
  t.is(res.statusCode, 200)
})

async function request (options) {
  await delay(15)
  return new Promise((resolve, reject) => {
    const req = require('http').request({
      port: server.address().port,
      ...options
    }, resolve)
    req.on('error', reject)
    req.end()
  })
}

test.after.always(async t => {
  await require('mudb').drop('/tmp/subscribers.json').catch(() => {})
})
