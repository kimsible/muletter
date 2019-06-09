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

module.exports = {
  validate
}
