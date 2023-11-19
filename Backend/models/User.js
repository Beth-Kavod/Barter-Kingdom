const mongoose = require('mongoose')
const userSchema = new mongoose.schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
},
{
  collection: 'users',
  timestamps: true 
})

module.exports = mongoose.model('User', userSchema)