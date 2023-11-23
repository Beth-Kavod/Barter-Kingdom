const mongoose = require("mongoose")
const Schema = mongoose.Schema

let commentSchema = new Schema({
    author: { type: String, required: true }, 
    content: { type: String, required: true },
    postID: { type: String, required: true},
    votes: { type: Array, required: false },
    voteCount: { type: Number, required: false }
},{
    collection: 'comments',
    timestamps: true
})

module.exports = mongoose.model('Comment', commentSchema)