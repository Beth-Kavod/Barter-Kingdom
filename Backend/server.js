const express = require('express')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
const cors = require("cors")
/* const http = require('http');
const socketIo = require('socket.io'); */
const app = express()

require("dotenv").config()

const MetaMaskAPI = require('./routes/metamaskAPI')


const port = process.env.port || 4000

/* --------------------------- cloudinary Config ---------------------------- */

/* cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
}); */

/* ----------------------------- MongoDB connect ---------------------------- */

/* const mongodbURl = process.env.mongodbURl

mongoose
  .connect(mongodbURl)
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err.reason);
  }) */

/* ----------------------------- Add middleware ----------------------------- */

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended : true
}))

/* -------------------- Add Socket.IO to the HTTP server -------------------- */

// Not yet needed
/* const server = http.createServer(app);
const io = socketIo(server); */

/* ------------------------------- App routes ------------------------------- */

/* app.use("/posts", postRoute)
app.use("/users", userRoute)
app.use("/comments", commentRoute)
app.use("/votes", voteRoute) */
app.use('/metamask', MetaMaskAPI)


/* ----------------------------- Error handling ----------------------------- */

app.use((err, req, res, next) => {
  if(!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message)
})

/* ------------------------------ Start server ------------------------------ */

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
})

/* server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
}) */