const express = require('express')
const router = express.Router()

let { getUserWithID, countVotes, isValid_id, isDuplicate } = require("../routeMethods.js")

/* ----------------------------- MongoDB Schemas ---------------------------- */

let Post = require("../../models/blog/Post.js")
let Comment = require("../../models/blog/Comment.js")

// All votes start with /votes

/* ---------------------------- Post vote on post --------------------------- */

router.post("/post/:id", async (req, res, next) => {
  const postID = req.params.id
  const userID = req.query.userID

  const { author, vote } = req.body

  if (!(await isValid_id(res, postID, Post))) return false
  if (await isDuplicate(req, res, postID, author)) return true

  const user = await getUserWithID(res, userID);

  try {
    if (!user) {
      res.status(403).json({
        message: "You must be logged in to cast a vote",
        status: 403,
      })
      return false
    }

    const originalPost = await Post.findById(postID);

    const updatedPost = await Post.findByIdAndUpdate(
      postID,
      { 
        $push: { votes: { author, vote } },
        $set: { voteCount: countVotes([...originalPost.votes, { author, vote }]) }
      },
      { new: true }
    )

    res.status(200).json({
      message: `Vote on post ${postID} successful`,
      voteCount: updatedPost.voteCount,
      status: 200,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return next(err);
  }
});



/* -------------------------- Post vote on comment -------------------------- */

router.post("/comment/:id", async (req, res, next) => {
  const commentID = req.params.id;
  const userID = req.query.userID

  let { author, vote } = req.body

  if (!await isValid_id(res, commentID, Comment)) return false;
  if (await isDuplicate(req, res, commentID, author)) return true;

  const user = await getUserWithID(res, userID)

  try {
    if (!user) {
      res.status(403).json({
        message: "You must be logged in to cast a vote",
        status: 403
      })
      return false
    }

    const newVote = { author, vote }

    const originalComment = await Comment.findById(commentID);

    const updatedComment = await Comment.findByIdAndUpdate(
      commentID,
      { 
        $push: { votes: newVote },
        $set: { voteCount: countVotes([...originalComment.votes, newVote]) }
      },
      { new: true }
    )
    
    const voteCount = updatedComment.voteCount;

    res.status(200).json({
      message: `Vote on comment ${commentID} successful`,
      voteCount: voteCount,
      status: 200
    });
  } catch (err) {
    return next(err);
  }
});


/* -------------------------------------------------------------------------- */
  
module.exports = router
