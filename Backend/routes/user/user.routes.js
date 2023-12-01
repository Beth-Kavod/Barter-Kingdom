const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
const filter = require('leo-profanity');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createSecretToken } = require("../../util/secretToken.js")
require('dotenv').config()

const { getUserWithID, getIdWithName, createResponse } = require('../routeMethods.js')

const availableTags = require('../../data/tags')

/* ----------------------------- MongoDB Schemas ---------------------------- */

const User = require('../../models/user/User.js')

// All users start with /users

/* ------------------------------ Get all users ----------------------------- */

router.get("/", async (req, res, next) => {
  const userID = req.query.userID
  let user = userID ? await getUserWithID(res, userID) : { username: "newUser", id: "", admin: false }
  
  try {
    await User
      .find()
      .then(users => {
        if (!user.admin) {
          const usernames = users.map((user) => user.username);
  
          res.status(200).json({
            success: true,
            message: `All ${usernames.length} users found`,
            userCount: usernames.length,
            users: usernames
          });
        } else {
          // If the user is an admin, include all user data in the response
          res.status(200).json({
            success: true,
            message: `All ${users.length} users found`,
            userCount: users.length,
            users: users
          });
        }
      })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred fetching all users`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ------------------------------ Search users ------------------------------ */

router.get("/search/:query", async (req, res, next) => {
  const query = req.params.query
  const userID = req.query.userID
  const regexQuery = new RegExp(query, 'i')

  let user = userID ? await getUserWithID(res, userID) : { username: "newUser", id: "", admin: false }

  try {
    await User
      .find({
        $or: [
          { username: { $regex: regexQuery }},
          { bio: { $regex: regexQuery }},
          { tribe: { $regex: regexQuery }},
          { tags: { $elemMatch: { $regex: regexQuery }}}
        ]
      })
      .then(users => {
        if (!user.admin) {
          const usernames = users.map((user) => user.username);

          let message = usernames.length > 0 ? 
            `All ${usernames.length} users found with query "${query}"` 
            : 
            `No users found from query "${query}"`
  
          res.status(200).json({
            success: true,
            message: message,
            userCount: usernames.length,
            users: usernames
          })

          return 
        } else {
          // If the user is an admin, include all user data in the response
          console.log(user)
          res.status(200).json({
            success: true,
            message: message,
            userCount: users.length,
            users: users
          })
        }
      })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred fetching users with query "${query}"`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ------------------------------ Follow a user ----------------------------- */

router.post('/follow/:followerName', async (req, res) => {
  const followerName = req.params.followerName
  const userID = req.query.userID

  if (!userID) return res.status(401).json({
    success: false,
    message: "You must be signed in and authenticated to follow someone"
  }) 
  
  try {  
    const requestingUser = await getUserWithID(res, userID)
    
    const receivingUser_id = await getIdWithName(res, followerName)
    
    if (requestingUser.username === followerName ) {
      return res.status(403).json({
        success: false,
        message: 'Cannot follow yourself'
      })
    }
  
    const isAlreadyFollowing = requestingUser.following.includes(receivingUser_id)

    if (!isAlreadyFollowing) {
      // Update self with new follower
      await User
      .findOneAndUpdate(
        { _id: requestingUser._id }, 
        { 
          $push: { following: receivingUser_id },
          $inc: { followingCount: 1 }
        }, 
        { new: true }
      )
      // Update person you are following
      await User
        .findOneAndUpdate(
          { username: followerName },
          { 
            $push: { followers: requestingUser._id },
            $inc: { followerCount: 1 }
          },
          { new: true }
        )
    } else {
      return res.status(200).json({
        success: true,
        message: `User ${requestingUser.username} is already following ${followerName}, nothing has been updated`
      })
    }
          
    res.status(200).json({
      success: true,
      message: `${requestingUser.username} is now following ${followerName}`
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something went wrong following user: ${followerName}`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ----------------------------- Unfollow a user ---------------------------- */

router.post('/unfollow/:followerName', async (req, res) => {
  const followerName = req.params.followerName
  const userID = req.query.userID

  if (!userID) return res.status(401).json({
    success: false,
    message: "You must be signed in and authenticated to unfollow someone"
  }) 

  try {  
    const requestingUser = await getUserWithID(res, userID)
    if (!requestingUser) return false
    
    const receivingUser_id = await getIdWithName(res, followerName)
    if (!receivingUser_id) return false
  
    const isAlreadyFollowing = requestingUser.following.includes(receivingUser_id)

    if (isAlreadyFollowing) {
      await Promise.all([   
        // Update self with new follower
        await User
        .findOneAndUpdate(
          { _id: requestingUser._id }, 
          { 
            $pull: { following: receivingUser_id },
            $inc: { followingCount: - 1 }
          }, 
          { new: true }
        ),
        // Update person you are following
        await User
          .findOneAndUpdate(
            { username: followerName },
            {
              $pull: { followers: requestingUser._id },
              $inc: { followerCount: - 1 }
            },
            { new: true }
          )
      ])
    } else {
      return res.status(200).json({
        success: true,
        message: `User ${requestingUser.username} is not following ${followerName}, nothing has been updated`
      })
    }
          
    res.status(200).json({
      success: true,
      message: `${requestingUser.username} has unfollowed ${followerName}`
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something went wrong unfollowing user: ${followerName}`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ----------------------- Get users profile with name ---------------------- */

router.get("/profile/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID

  try {
    let requestingUser = userID ? await getUserWithID(res, userID) : { username: "", id: "", admin: false} 
  
    await User
      .findOne({username: name})
      .then(user => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: `No user found with the username ${name}`
          })
        }

        const userData = { 
          username, 
          admin, 
          avatar, 
          createdAt, 
          bio, 
          followers, 
          following
        } = user

        if (requestingUser.username === name || requestingUser.admin) {
          return res.status(200).json({
            success: true,
            message: `User ${user.username} found`,
            user
          })
        } else {
          return res.status(200).json({
            success: true,
            message: `User ${user.username} found`, 
            user: {
              ...userData,
              followersCount: followers.length
            }
          })
        }
      }) 
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `An error occurred fetching profile`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* --------------------------- Update users avatar -------------------------- */

router.post("/update-avatar", async (req, res, next) => {
  const { username, url } = req.body;
  const userID = req.query.userID || ""

  function deletePhoto(url) {
    try {
      const publicId = url.split('/').pop().split('.')[0]
      cloudinary.v2.api
      .delete_resources([
        `Avatars/${publicId}`], 
        { type: 'upload', resource_type: 'image' })
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: `Error deleting profile photo`,
        errorMessage: err.message,
        error: err
      })
    }
  }

  try {
    let requestingUser = userID ? await getUserWithID(res, userID) : { username: "", id: "", admin: false} 

    if (requestingUser.username !== username) {
      res.status(403).json({
        success: false,
        message: `User ${requestingUser.username} not allow to update profile photo`
      })
      deletePhoto(url)
      return false
    }

    const user = await User.findOne({ username })

    if (user.avatar) deletePhoto(user.avatar)

    await User.findOneAndUpdate(
      { username }, 
      { avatar: url }, 
      { new: true }
    )

    res.status(201).json({
      success: true,
      message: `${username}'s avatar was updated.`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred updating "${username}"'s avatar`,
      errorMessage: err.message,
      error: err
    })
    return next(err);
  }
})

/* -------------------- Update users profile information -------------------- */
// ! NOT FINISHED, UPDATING PROFILE NOT USEFUL
router.post("/update-profile/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)
  // ! ADD MORE FIELDS LATER
  const { email } = req.body
    
  try {
    if (name !== user.username && !user.admin) {
      res.status(403).json({
        success: false,
        message: `User ${name}, not able to edit ${user.username}'s profile`
      })
      return false
    }

    await User
      .findOneAndUpdate(
        {username: name}, 
        {email: email},
        {new: true}
      )
      .then(result => {
        if (!result) return res.status(404).send(`No user found with the username ${user.username}`)
        
        res.status(200).json({
          success: true,
          message: `User ${result.username} found and updated`
        })
      }) 
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred updating "${name}"'s profile`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})
// ! NOT FINISHED YET

/* ---------------------------- Add tags to user ---------------------------- */

router.post("/add-tags/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID
  
  const { newTags }= req.body

  const user = await getUserWithID(res, userID)
  
  try {
    if (name !== user.username && !user.admin) {
      return res.status(403).json({
        success: false,
        message: `User ${user.username}, not able to edit ${name}'s tags`
      })
    }

    const allTagsIncluded = newTags.every(tag => availableTags.includes(tag));

    if (!allTagsIncluded && !user.admin) {
      return res.status(403).json({
        success: false,
        message: `One of [${newTags}] is not an available tag for user ${user.username}`
      })
    }

    await User
      .findOneAndUpdate(
        {username: name},
        { $addToSet: { tags: { $each: newTags } } },
        { new: true }
      )
      .then(result => {
        if (!result) return res.status(404).send(`No user found with the username ${user.username}`)
        
        res.status(200).json({
          success: true,
          message: `User ${result.username} found and updated`, 
          added: newTags
        })
      }) 
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred adding tags to user "${username}"`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* -------------------------- Remove tags from user ------------------------- */

router.post("/remove-tags/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID
  
  const { removeTags }= req.body

  const user = await getUserWithID(res, userID)
  
  try {
    if (name !== user.username && !user.admin) {
      return res.status(403).json({
        success: false,
        message: `User ${user.username}, not able to edit ${name}'s tags`
      })
    }

    await User
      .findOne(
        { username: name },
        { new: false }
      )
      .then(async result => {
        if (!result) {
          return res.status(404).json({
            success: false,
            message: `No user found with the username ${user.username}`
          });
        }

        // Check if all tags in removeTags exist in the tags array
        const tagsExist = removeTags.every(tag => result.tags.includes(tag));

        if (!tagsExist) {
          return res.status(400).json({
            success: false,
            message: `Not have every tag in [${removeTags}] exist in the user's tags`,
            removeTags: removeTags
          })
        }

        let updatedUser = await User.findOneAndUpdate(
          { username: name },
          { $pull: { tags: { $in: removeTags } } },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: `User ${updatedUser.username} found and updated`,
          removed: removeTags,
          updatedTags: updatedUser.tags
        })
      })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred removing tags from user "${username}"`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ----------------------- Set an account to be admin ----------------------- */

router.post("/make-admin/:id", async (req, res, next) => {
  const id = req.params.id
  const userID = req.query.userID

  const adminMapping = {
    "true": true,
    "false": false,
  };

  const admin = adminMapping[req.query.admin] || null;
  
  if (req.query.admin === null) {
    return res.status(422).json({
        success: false,
        message: `Admin query needs to be set as boolean`
      })
    }
  
  let user = await getUserWithID(res, userID)

  if (!user.admin) {
    return res.status(403).json({
      success: false,
      message: `User with id: ${userID} not allowed to promote users`
    })
  }
    
  try {
    await User
      .findByIdAndUpdate(
        id, 
        { admin: admin },
        { new: true }
      )
      .then(user => {
        if (!user) return res.status(404).send(`No user found with the _id: ${id}`)

        let message =  admin ? `User ${user.username} found and given admin` : `User ${user.username} found and revoked admin`
        res.status(200).json({
          success: true,
          message: message,
          name: user.username, 
          id: user._id
        })
      }) 
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `An error occurred changing user "${username}"'s admin status`,
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* ------------------------------- Delete user ------------------------------ */

router.post("/delete/:userAuthID", async (req, res, next) => {
  const userAuthID = req.params.userAuthID
  const userID = req.query.userID

  const requestingUser = await getUserWithID(res, userID)
  
  if (!requestingUser.admin && userID !== userAuthID ) {
    return res.status(403).json({
      success: false,
      message: `User ${requestingUser.username} not allowed to delete another user`
    })
  }
  
  try {
    const response = await User.deleteOne({userAuthID: userAuthID})

    if (response.status === 200) {
      return res.status(200).json({
        success: true,
        message: `User ${requestingUser.username} deleted account ${userAuthID}`,
        mongoDB: response
      })
    } else {
      return res.status(500).json({
        success: false,
        message: `Something went wrong deleting user`,
        mongoDB: response
      })
    }
  } catch(err) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong when deleting user',
      errorMessage: err.message,
      error: err
    })
    return next(err)
  }
})

/* -------------------------------------------------------------------------- */

module.exports = router