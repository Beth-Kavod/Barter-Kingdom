require('dotenv').config
const jwt = require('jsonwebtoken')

const { SECRET_KEY } = process.env
module.exports.createSecretToken = (userData) => {
  return jwt.sign(userData, SECRET_KEY/* , {expiration: "3h"} */)
}