'use strict'

const test = require('ava')
const { validate, authorize } = require('./util')

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

process.env.KEY = '123'

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
