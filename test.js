'use strict'

const test = require('ava')
const { validate } = require('./util')

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
