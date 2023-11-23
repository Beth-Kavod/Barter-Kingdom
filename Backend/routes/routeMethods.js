/* ----------------------------- MongoDB Schemas ---------------------------- */

const Post = require('../models/blog/Post')
const Comment = require('../models/blog/Comment')
const User = require('../models/user/User')

/* ------------------------------- Count votes ------------------------------ */

function countVotes(data) {
  let trueVotes = 0;
  let falseVotes = 0;

  for (const item of data) {
    if (item.vote === true) {
      trueVotes++;
    } else if (item.vote === false) {
      falseVotes++;
    }
  }

  return trueVotes - falseVotes;
}

/* ------------------------ check for duplicate vote ------------------------ */

async function isDuplicate(req, res, id, author) {
  try {
    let updatedDoc
    let { vote } = req.body

    let newVote = { author, vote }

    const existingVoteInPost = await Post.findOne({ _id: id, "votes.author": author })

    const existingVoteInComment = await Comment.findOne({ _id: id, "votes.author": author })

    if (existingVoteInPost) {      
      updatedDoc = await Post.findOneAndUpdate(
        { _id: id, "votes.author": author },
        {
          $set: {
            'votes.$': newVote
          },
        },
        {
          new: true,
        }
      )

      updatedDoc.voteCount = countVotes(updatedDoc.votes);
      await updatedDoc.save()
      
    } else if (existingVoteInComment) {
      updatedDoc = await Comment.findOneAndUpdate(
        { _id: id, "votes.author": author },
        {
          $set: {
            'votes.$': newVote
          },
        },
        {
          new: true,
        }
      );
      updatedDoc.voteCount = countVotes(updatedDoc.votes);
      await updatedDoc.save()
    }

    console.log(updatedDoc)


    const existingVote = existingVoteInPost || existingVoteInComment

    if (existingVote) {
      res.status(200).json({
        message: `Vote successfully updated`,
        voteCount: updatedDoc.voteCount,
        status: 200
      })
      return true
    }

    return false
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'An error occurred in function isDuplicate',
      error: error
    });
  }
}

/* -------------------------- Check if post exists -------------------------- */

async function isValid_id(res, id, schema) {
  try {
    const post = await schema.findById(id);
    if (!post) throw new Error;
    return true;
  } 
  catch (error) {
    res.status(404).json({
      id: id,
      message: `Post with _id: ${id} not found`
    });
    return false;
  }
}

/* ---------------------- Get a users auth with authID ---------------------- */

async function getUserWithID(res, userID) {
  try {
    const user = await User.findOne({ userAuthID: userID })
    if (!user) throw new Error
    return user
  }
  catch (error) {
    res.status(404).json({
      userID: userID,
      message: `User with userAuthID: ${userID} not found`
    });
    return false;
  }
}

/* -------------------------------------------------------------------------- */

module.exports = { countVotes, isValid_id, isDuplicate, getUserWithID }