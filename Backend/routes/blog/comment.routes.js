const express = require('express')
const router = express.Router()
const filter = require('leo-profanity')

let { countVotes, isValid_id, getUserWithID } = require("../routeMethods.js")

/* --------------------------- MongodDB Connection -------------------------- */

const blogDB = require('../../connections/blogDB')

/* ----------------------------- MongoDB Schemas ---------------------------- */

let postSchema = require("../../models/blog/Post.js")
let commentSchema = require("../../models/blog/Comment.js")

// All comments start with /comments

/* ------------------------ Get all Comments on post ------------------------ */

router.get("/:id", async (req, res, next) => {
  const postID = req.params.id

  if (!await isValid_id(res, postID, postSchema)) return false
  
  try {
    await commentSchema
    .find({
      postID: postID
    })
    .then((result) => {
      console.log(result)
      res.status(200).json({
        data: result.reverse(),
        message: "Comments successfully fetched",
        status: 200,
      })
    })
  } catch(err) {
    return next(err)
  }
})

/* ------------------------------ Make comment ------------------------------ */

router.post("/create/:id", async (req, res, next) => {
  const postID = req.params.id

  if (!await isValid_id(res, postID, postSchema)) return false

  req.body.content = filter.clean(req.body.content);

  try {
    const newComment = await commentSchema.create({
      ...req.body,
      postID: postID
    });

    // Find the corresponding post and push the new comment to its 'comments' array
    const post = await postSchema.findByIdAndUpdate(
      postID,
      { $push: { comments: newComment._id } },
      { new: true } // This option returns the modified document
    );

    res.status(200).json({
      message: "Comment successfully created",
      status: 200,
      post: post, // Optionally, you can include the updated post in the response
    });
  } catch(err) {
    return next(err)
  }
})

/* ------------------------------ Edit comment ------------------------------ */

router.post("/edit/:id", async (req, res, next) => {
  const commentID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, commentID, commentSchema)) return false

  try {
    const comment = await commentSchema.findById(commentID)

    if (user.username !== comment.author && !user.admin) {
      res.status(403).json({
        message: `User ${user.username} not authorized to edit ${comment.author}'s comment`
      })
      return false
    }

    req.body.content = filter.clean(req.body.content);

    await commentSchema
    .findByIdAndUpdate(commentID, req.body, { new: true })
    .then(content => {
      res.status(200).json({
        message: "Comment updated successfully",
        comment: content,
        status: 200,
      })
    })
  } catch(err) {
    return next(err)
  }
})

/* ----------------------------- Delete comment ----------------------------- */

router.post("/delete/:id", async (req, res, next) => {
  const commentID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, commentID, commentSchema)) return false
  
  try {
    const comment = await commentSchema.findById(commentID)

    if (user.username !== comment.author && !user.admin) {
      res.status(403).json({
        message: 'You do not have permission to delete this comment'
      })
      return false
    }

    await commentSchema.findByIdAndDelete(commentID)

    res.status(204).json({
      message: "Comment and votes successfully Deleted",
      status: 200,
    })
  } catch(err) {
    return next(err)
  }
})

/* -------------------------------------------------------------------------- */
  
module.exports = router