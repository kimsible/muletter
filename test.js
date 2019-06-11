'use strict'

const test = require('ava')
const delay = require('delay')

const { request: cbRequest } = require('http')

process.env.KEY = '123'
process.env.STORAGE = '/tmp'
const server = require('./server')

test('server - 500 Error', async t => {
  const res = await request({ method: 'POST', path: '/email@provider.com' }, 0)
  t.is(res.statusCode, 500)
})

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

async function request (options, wait = 15) {
  await delay(wait)
  return new Promise((resolve, reject) => {
    const req = cbRequest({
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
