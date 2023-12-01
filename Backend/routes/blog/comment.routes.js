const express = require('express')
const router = express.Router()
const filter = require('leo-profanity')

let { isValid_id, getUserWithID, createResponse } = require("../routeMethods.js")

/* ----------------------------- MongoDB Schemas ---------------------------- */

let Post = require("../../models/blog/Post.js")
let Comment = require("../../models/blog/Comment.js")

// All comments start with /comments

/* ------------------------ Get all Comments on post ------------------------ */

router.get("/:id", async (req, res, next) => {
  const postID = req.params.id

  if (!await isValid_id(res, postID, Post)) return false
  
  try {
    await Post
    .findById(postID)
    .populate('comments')  
    .then((result) => {
      console.log(result)
      res.status(200).json({
        success: true,
        message: "Comments successfully fetched",
        data: result.comments
      })
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `An error occurred fetching comment with _id: "${postID}"`,
      error: err
    })
    return next(err)
  }
})

/* ------------------------------ Make comment ------------------------------ */

router.post("/create/:id", async (req, res, next) => {
  const postID = req.params.id

  if (!await isValid_id(res, postID, Post)) return false

  req.body.content = filter.clean(req.body.content);

  try {
    const newComment = await Comment.create(
      { ...req.body, postID: postID }
    )

    // Find the corresponding post and push the new comment to its 'comments' array
    const updatedPost = await Post.findByIdAndUpdate(
      postID,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    if (!newComment || !updatedPost) {
      // If either the comment creation or post update fails, handle the error
      return res.status(500).json({
        success: false,
        message: "Failed to create comment or update post"
      });
    }

    // Both comment creation and post update were successful
    res.status(201).json({
      success: true,
      message: "Comment successfully created",
      comment: newComment,
      updatedPost: updatedPost
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `An error occurred creating comment on post with _id: "${postID}"`,
      error: err
    })
    return next(err)
  }
})

/* ------------------------------ Edit comment ------------------------------ */

router.post("/edit/:id", async (req, res, next) => {
  const commentID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, commentID, Comment)) return false  

  try {
    const comment = await Comment.findById(commentID)

    if (user.username !== comment.author && !user.admin) {
      res.status(403).json({
        message: `User ${user.username} not authorized to edit ${comment.author}'s comment`
      })
      return false
    }

    req.body.content = filter.clean(req.body.content);

    await Comment
    .findByIdAndUpdate(commentID, req.body, { new: true })
    .then(content => {
      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment: content
      })
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `An error occurred editing comment with _id: "${commentID}"`,
      error: err
    })
    return next(err)
  }
})

/* ----------------------------- Delete comment ----------------------------- */

router.post("/delete/:id", async (req, res, next) => {
  const commentID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, commentID, Comment)) return false
  
  try {
    const comment = await Comment.findById(commentID)

    if (user.username !== comment.author && !user.admin) {
      res.status(403).json({
        message: 'You do not have permission to delete this comment'
      })
      return false
    }

    await Comment.findByIdAndDelete(commentID)

    res.status(204).json({
      success: true,
      message: "Comment and votes successfully Deleted"
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `An error occurred deleting comment with _id: "${commentID}"`,
      error: err
    })
    return next(err)
  }
})

/* -------------------------------------------------------------------------- */
  
module.exports = router