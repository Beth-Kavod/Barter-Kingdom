const mongoose = require("mongoose")
const Schema = mongoose.Schema
const blogDB = require('../../connections/blogDB')
require('dotenv').config()

let commentSchema = new Schema({
    author: { type: String, required: true }, 
    content: { type: String, required: true },
    votes: { type: Array, required: false },
    voteCount: { type: Number, required: false },
    postID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
},{
    collection: 'comments',
    timestamps: true
})

const Comment = blogDB.model('Comment', commentSchema)

blogDB.once('open', () => {
    console.log('Connected to blogDB for comments')
})

module.exports = Comment