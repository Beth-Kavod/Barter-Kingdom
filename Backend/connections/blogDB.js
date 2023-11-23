const mongoose = require('mongoose')
const { MONGO_URL_BLOG } = process.env

const Blog_Connection = mongoose
  .createConnection(MONGO_URL_BLOG)
  /* .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err.reason);
  }) */

module.exports = Blog_Connection