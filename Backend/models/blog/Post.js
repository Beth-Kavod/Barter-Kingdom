const mongoose = require("mongoose");
const Schema = mongoose.Schema

let postSchema = new Schema({
    author: { type: String, required: true}, 
    title: { type: String, required: true },
    content: { type: String, required: true },
    votes: { type: Array, required: false },
    voteCount: { type: Number, required: false },
    imageUrl: { type: String, required: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
},{
    collection: 'posts',
    timestamps: true
})

module.exports = mongoose.model('Post', postSchema)