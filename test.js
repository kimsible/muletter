'use strict'

const test = require('ava')
const delay = require('delay')

const { request: cbRequest } = require('http')
const { body } = require('./util')

process.env.KEY = '123'
process.env.STORAGE = '/tmp'
const server = require('./server')

test('server - 500 Error', async t => {
  const res = await request({ method: 'POST', body: 'email@provider.com' }, 0)
  t.is(res.statusCode, 500)
})

test('server - Method Not Allowed', async t => {
  const res = await request({ method: 'OPTIONS' })
  t.is(res.statusCode, 405)
})

test('server - POST 409 Error', async t => {
  const res = await request({ method: 'POST', body: 'email@provider' })
  t.is(res.statusCode, 409)
})

test('server - POST 200 OK', async t => {
  const res = await request({ method: 'POST', body: 'email@provider.com' })
  t.is(res.statusCode, 200)
})

test('server - DELETE 200 OK', async t => {
  const res = await request({
    method: 'DELETE',
    path: '/ky8857XlEj1NXFHh',
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

test('server - PUT 401 Error', async t => {
  const res = await request({
    method: 'PUT',
    path: '/',
    headers: {
      authorization: 'Basic abc'
    }
  })
  t.is(res.statusCode, 401)
})

test('server - PUT 500 Error', async t => {
  const res = await request({
    method: 'PUT',
    path: '/',
    headers: {
      authorization: 'Basic 123'
    },
    body: JSON.stringify('e')
  })
  t.is(res.statusCode, 500)
})

test('server - PUT 200 Ok', async t => {
  const res = await request({
    method: 'PUT',
    path: '/',
    headers: {
      authorization: 'Basic 123'
    },
    body: JSON.stringify({
      smtp: 'smtps://user:pass@smtp-mail.example.com'
    })
  })
  t.is(res.statusCode, 200)
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

test('server - GET /', async t => {
  // add at least fixture
  await request({
    method: 'POST',
    body: 'user@provider.com'
  })
  // export
  const res = await request({
    method: 'GET',
    path: '/',
    headers: {
      authorization: 'Basic 123'
    }
  })
  const data = await body(res)
  t.is(typeof data, 'string')
  t.regex(data, /\n/)
})

test('server - GET /?verbose', async t => {
  // add at least fixture
  await request({
    method: 'POST',
    body: 'user@provider.com'
  })
  // export
  const res = await request({
    method: 'GET',
    path: '/?verbose',
    headers: {
      authorization: 'Basic 123'
    }
  })
  const data = JSON.parse(await body(res))
  t.is(typeof data, 'object')
  t.is(typeof data[0]._id, 'string')
  t.is(typeof data[0].email, 'string')
  t.regex(data[0]._id, /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/) // is base64
})

test('server - POST / {random}@domain.com', async t => {
  const input = `${Math.random()}@domain.com`
  // add
  await request({
    method: 'POST',
    body: input
  })
  // export
  const res = await request({
    method: 'GET',
    path: '/',
    headers: {
      authorization: 'Basic 123'
    }
  })
  const data = await body(res)

  // check if exists and no duplicate entry
  const matches = data.matchAll(new RegExp(input))
  t.true(Array.from(matches).length > 0)
  t.is(Array.from(matches).length, 0)
})

test('server - DELETE / {random}@domain.com', async t => {
  const input = `${Math.random()}@domain.com`
  let res, data, item
  // add
  await request({
    method: 'POST',
    body: input
  })
  // get ID
  res = await request({
    method: 'GET',
    path: '/?verbose',
    headers: {
      authorization: 'Basic 123'
    }
  })
  data = JSON.parse(await body(res))
  item = data.find(i => i.email === input)
  t.not(item, undefined)
  // delete
  await request({
    method: 'DELETE',
    path: '/' + item._id
  })
  // check if deleted
  res = await request({
    method: 'GET',
    path: '/?verbose',
    headers: {
      authorization: 'Basic 123'
    }
  })
  data = JSON.parse(await body(res))
  item = data.find(i => i.email === input)
  t.is(item, undefined)
})

async function request (options, wait = 15) {
  await delay(wait)
  return new Promise((resolve, reject) => {
    const req = cbRequest({
      port: server.address().port,
      ...options
    }, resolve)
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

test.after.always(async t => {
  await require('mudb').drop('/tmp/subscribers.json').catch(() => {})
})
