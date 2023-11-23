const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  username: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  password: { type: String, required: true },
  avatar: { type: String, required: false },
  tags: { type: Array, required: false },
  bio: { type: String, required: false },
  admin: { type: Boolean, required: true },
  userAuthID: { type: String, required: true },
  walletAddress: { type: String, unique: false, required: true }, //make unique true when posted
  tribe: {type: String, enum: tribes, default: "", required: false }
},
{
  collection: 'users',
  timestamps: true 
})

module.exports = mongoose.model('User', userSchema)