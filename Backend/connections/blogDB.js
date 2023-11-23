const mongoose = require('mongoose')
const { MONGO_URL_BLOG } = process.env

const blogDB = mongoose.createConnection(MONGO_URL_BLOG);

module.exports = blogDB