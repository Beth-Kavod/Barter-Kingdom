const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const cloudinary = require('cloudinary')
/* const http = require('http');
const socketIo = require('socket.io'); */
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 4000

const { CLOUD_NAME, API_KEY, SECRET_CLOUDINARY_KEY } = process.env

const MetaMaskAPI = require('./routes/metamaskAPI')

/* ------------------------------- Blog routes ------------------------------ */

const commentRoute = require('./routes/blog/comment.routes')
const postRoute = require('./routes/blog/post.routes')
const voteRoute = require('./routes/blog/vote.routes')

/* ------------------------------- Chat routes ------------------------------ */

/* ------------------------------- User routes ------------------------------ */

const authRoute = require('./routes/user/auth.routes')
const userRoute = require('./routes/user/user.routes')

/* --------------------------- cloudinary Config ---------------------------- */

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: SECRET_CLOUDINARY_KEY,
  secure: true,
});

/* ----------------------------- Add middleware ----------------------------- */

const authMiddleware = require('./middleware/authMiddleware')

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT")
  res.setHeader("Access-Control-Allow-Headers", "content-Type")
  next()
})

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'httponly', 'Authorization'],
  credentials: true,
  methods: ['GET', 'POST'],
}



app.use(cors(corsOptions))
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended : true
}))

/* -------------------- Add Socket.IO to the HTTP server -------------------- */

// Not yet needed
/* const server = http.createServer(app);
const io = socketIo(server); */

/* ------------------------------- App routes ------------------------------- */

app.use('/auth', authRoute)
app.use('/posts', postRoute)
app.use('/users', userRoute)
app.use('/comments', commentRoute)
app.use('/votes', voteRoute)
app.use('/metamask', MetaMaskAPI)

app.post('/', authMiddleware)

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