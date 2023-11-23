const mongoose = require('mongoose')
const { MONGO_URL_CHAT } = process.env

const Chat_Connection = mongoose
  .createConnection(MONGO_URL_CHAT)
  /* .then(x => {
    console.log(`Connected to Chat Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to Chat mongo', err.reason);
  }); */

module.exports = Chat_Connection
