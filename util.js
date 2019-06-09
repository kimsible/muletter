'use strict'

const validate = req => {
  const { url } = req
  const email = url.substr(1)
  const regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
  if (regex.test(email)) {
    return email
  }
  throw new Error('Conflict Error')
}

const authorize = req => {
  const { authorization } = req.headers
  const [, key] = (authorization || '').match(/^Basic (.+)$/)
  if (key === process.env.KEY) {
    return key
  }
  throw new Error('Unauthorized Error')
}

module.exports = {
  validate,
  authorize
}
