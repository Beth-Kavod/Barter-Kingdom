const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require("cors")
const cookieParser = require('cookie-parser')
/* const http = require('http');
const socketIo = require('socket.io'); */
require("dotenv").config()

const app = express()

const PORT = process.env.PORT || 4000

const { MONGO_URL_USER, MONGO_URL_BLOG, MONGO_URL_CHAT } = process.env

const postSchema = require('./models/blog/Post')

/* ------------------------------ Server Routes ----------------------------- */

const commentRoute = require('./routes/blog/comment.routes')
const postRoute = require('./routes/blog/post.routes')
const voteRoute = require('./routes/blog/vote.routes')

const userRoute = require('./routes/user.routes')
const MetaMaskAPI = require('./routes/metamaskAPI')

/* --------------------------- cloudinary Config ---------------------------- */

/* cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
}); */

/* ----------------------------- MongoDB connect ---------------------------- */

/* const blogDB = mongoose.createConnection(MONGO_URL_BLOG);

const chatDB = mongoose.createConnection(MONGO_URL_CHAT); */

// blogDB.model(postSchema.modelName, postSchema);
/* blogDB.once('open', () => {
  console.log('Connected to Blog MongoDB');
});

chatDB.once('open', () => {
  console.log('Connected to Chat MongoDB');
}); */

mongoose.connect(MONGO_URL_USER)
.then(x => {
  console.log(`connected to ${x.connections[0]}`)
})

/* ----------------------------- Add middleware ----------------------------- */
app.use(cookieParser());
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

app.use("/posts", postRoute)
app.use("/users", userRoute)
app.use("/comments", commentRoute)
app.use("/votes", voteRoute)
app.use('/metamask', MetaMaskAPI)


/* ----------------------------- Error handling ----------------------------- */

app.use((err, req, res, next) => {
  if(!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message)
})

/* ------------------------------ Start server ------------------------------ */

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
})

/* server.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
}) */