require('dotenv').config
const jwt = require('jsonwebtoken')

const { SECRET_KEY } = process.env
module.exports.createSecretToken = (userAuthID) => {
  return jwt.sign(userAuthID, SECRET_KEY/* , {expiration: 3 * 24 * 60 * 60} */)
}