const bcrypt = require('bcryptjs') 

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
        success: true,
        message: `Vote successfully updated`,
        voteCount: updatedDoc.voteCount
      })
      return true
    }

    return false
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred in function isDuplicate',
      error: error
    });
  }
}

/* -------------------------- Check if document exists -------------------------- */

async function isValid_id(res, id, schema) {
  try {
    const document = await schema.findById(id);
    if (!document) throw new Error;
    return true;
  } 
  catch (error) {
    res.status(404).json({
      success: false,
      message: `Document with ID ${id} not found in ${schema.modelName} collection`,
      id: id
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
      success: false,
      message: `User with userAuthID: ${userID} not found`,
      userID: userID
    });
    return false;
  }
}

/* ----------------- Generate userAuthID on account creation ---------------- */

function generateUserAuthID() {
  const getRandomChar = () => {
    const characters = '0123456789ABCDEF';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  };

  const generateBlock = () => {
    let block = '';
    for (let i = 0; i < 6; i++) {
      block += getRandomChar();
    }
    return block;
  };

  return `${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}`;
}

/* -------------------- Hash password on account creation ------------------- */

async function hashPassword(password) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw error;
  }
}

/* -------------------------------------------------------------------------- */

module.exports = { countVotes, isValid_id, isDuplicate, getUserWithID, generateUserAuthID, hashPassword }