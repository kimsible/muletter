'use strict'

const body = req => new Promise((resolve, reject) => {
  let string = ''
  req.setEncoding('utf8')
  req.on('data', chunk => { string += chunk })
  req.on('error', reject)
  req.on('end', () => { resolve(string) })
})

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
  body,
  validate,
  authorize
}
