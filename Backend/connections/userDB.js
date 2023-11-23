
const mongoose = require('mongoose')
const { MONGO_URL_USER } = process.env

const userDB = mongoose.createConnection(MONGO_URL_USER);

module.exports = userDB
