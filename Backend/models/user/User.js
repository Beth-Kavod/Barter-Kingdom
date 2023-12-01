const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userDB = require('../../connections/userDB')
require("dotenv").config()

const tribes = [
  "Benjamin",
  "Joseph",
  "Levi",
  "Gad",
  "Asher",
  "Naphtali",
  "Dan",
  "Reuben",
  "Judah",
  "Simeon",
  "Issachar",
  "Zebulon",
  ""
]

const userSchema = new Schema({
  /* -------------- Undo comments when finished with development -------------- */
  username: { type: String, unique: true, trim: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: false, default: "" },
  avatar: { type: String, required: false },
  tags: { type: Array, required: false },
  bio: { type: String, required: false },
  following: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
  followingCount: { type: Number, required: true },
  followerCount: { type: Number, required: true },
  admin: { type: Boolean, required: true },
  userAuthID: { type: String, required: true },
  walletAddress: { type: String, unique: false, required: true }, //make unique true when posted
  tribe: {type: String, enum: tribes, default: "", required: false }
},
{
  collection: 'users',
  timestamps: true 
})

const User = userDB.model('User', userSchema)

userDB.once('open', () => {
  console.log('Connected to userDB')
})

module.exports = User