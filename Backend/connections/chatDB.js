const mongoose = require('mongoose')
const { MONGO_URL_CHAT } = process.env

const chatDB = mongoose.createConnection(MONGO_URL_CHAT);

module.exports = chatDB
