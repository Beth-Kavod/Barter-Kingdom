const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
const filter = require('leo-profanity');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const secretKey = process.env.SECRET_KEY

const { getUserWithID } = require('./routeMethods.js')
const availableTags = require('../data/tags')

/* ----------------------------- MongoDB Schemas ---------------------------- */

const userSchema = require('../models/user/User')

// All users start with /users

/* ------------------------------ Get all users ----------------------------- */

router.get("/", async (req, res, next) => {
  const userID = req.query.userID
  let user

  if (!userID) {
    user = { username: "newUser", id: "", admin: false }
  } else {
    user = await getUserWithID(res, userID)
  }

  try {

    await userSchema
      .find()
      .then(users => {
        if (!user.admin) {
          const usernames = users.map((user) => user.username);
  
          res.status(200).json({
            users: usernames,
            message: `All ${usernames.length} users found`,
            userCount: usernames.length,
            status: 200,
          });
        } else {
          // If the user is an admin, include all user data in the response
          res.status(200).json({
            users: users,
            message: `All ${users.length} users found`,
            userCount: users.length,
            status: 200,
          });
        }
      })
  } catch (err) {
    return next(err)
  }
})

/* ----------------- Send username and password through form ---------------- */

router.post("/create", async (req, res, next) => {
  let {username, password, email, tribe, walletAddress } = req.body
  let hashedPassword 

  try {

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
    
    try {
      hashedPassword = await hashPassword(password);
    } catch (error) {
      console.error('Error hashing password', error);
    }

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

      return `${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}-${generateBlock()}`;
    }

    const userAuthID = generateUserAuthID();

    let data = await userSchema.create({
      username: username, 
      email: email,
      password: hashedPassword,
      userAuthID: userAuthID, 
      walletAddress: walletAddress,
      tribe: tribe,
      admin: false,
      bio: "",
      avatar: ""
    })
    
    res.status(201).json({
      message: `Creation of user ${username} successful`,
      user: data
    })

    return true

  } catch(err) {
    res.status(500).json({
      message: `Something went wrong creating user ${username}`
    }) 
    return next(err)
  }
})


/* ----------------- Send username and password through form ---------------- */
//! ALL OUTDATED, UPDATE ALL ROUTES
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userSchema.findOne({username: username})
    
    let passwordMatch = false

    if (user) {
      passwordMatch = await bcrypt.compare(password, user.password)
    }

    if (passwordMatch) {
      // Create a JWT
      const token = jwt.sign({ userAuthID: user.userAuthID }, secretKey, { expiresIn: '1d' });

      res.cookie('userAuthID', token, { httpOnly: true });
      res.json({ success: true });
    } else {
      res.status(403).json({ success: false, message: 'Invalid credentials' });
    }
  } catch(err) {
    return next(err)
  }
})

/* ------------------- Logout of account and delete cookie ------------------ */

router.get('/logout', (req, res, next) => {
  try {

    res.clearCookie('userAuthID');

    res.redirect('/');
  } catch (err) {
    res.status(500).json({
      message: `Something went wrong logging out`
    })
    return next(err)
  }
});

/* ---------------- Verify cookies to check logged in status ---------------- */
router.get('/protected', (req, res) => {
  // Check if the user is authenticated
  const token = req.cookies.userAuthID;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Verify the JWT
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // The JWT is valid, and the user is authenticated
    res.json({ success: true, userAuthID: decoded.userAuthID });
  });
});

/* ----------------------- Get users profile with name ---------------------- */

router.get("/profile/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID
  let request

  if (!userID) {
    request = { username: "", id: "", admin: false} 
  } else {
    request = await getUserWithID(res, userID)
  }

  try {

    await userSchema
      .findOne({username: name})
      .then(user => {
        if (!user) return res.status(404).json({ message: `No user found with the username ${name}` })
        
        const { username, admin, avatar, createdAt } = user

        if (request.username === name || request.admin) {
          res.status(200).json({
            user,
            message: `User ${user.username} found`, 
          })
          return
        } else {
          res.status(200).json({
            user: {
              username,
              admin, 
              avatar, 
              createdAt,
            },
            message: `User ${user.username} found`, 
          })
          return
        }
      }) 
  } catch(err) {
    return next(err)
  }
})

/* --------------------------- Update users avatar -------------------------- */

router.post("/update-avatar", async (req, res, next) => {
  const { username, url } = req.body;

  try {

    const user = await userSchema.findOne({ username })

    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      cloudinary.v2.api
        .delete_resources([`Avatars/${publicId}`], 
          { type: 'upload', resource_type: 'image' })
    }

    await userSchema.findOneAndUpdate(
      { username }, 
      { avatar: url }, 
      { new: true }
    )

    res.status(201).json({
      message: `${username}'s avatar was updated.`,
      status: 201
    });
  } catch (err) {
    return next(err);
  }
});

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
        message: `User ${name}, not able to edit ${user.username}'s profile`
      })
      return false
    }

    await userSchema
      .findOneAndUpdate(
        {username: name}, 
        {email: email},
        {new: true}
      )
      .then(result => {
        if (!result) return res.status(404).send(`No user found with the username ${user.username}`)
        
        res.status(200).json({
          message: `User ${result.username} found and updated`, 
          status: 200
        })
      }) 
  } catch (err) {
    return next(err)
  }
})

/* ---------------------------- Add tags to user ---------------------------- */

router.post("/add-tags/:name", async (req, res, next) => {
  const name = req.params.name
  const userID = req.query.userID
  
  const { newTags }= req.body

  const user = await getUserWithID(res, userID)

  try {

    if (name !== user.username/*  && !user.admin */) {
      res.status(403).json({
        message: `User ${user.username}, not able to edit ${name}'s tags`
      })
      return false
    }

    const allTagsIncluded = newTags.every(tag => availableTags.includes(tag));

    if (!allTagsIncluded && !user.admin) {
      res.status(403).json({
        message: `One of [${newTags}] is not an available tag for user ${user.username}`
      })
      return false
    }

    await userSchema
      .findOneAndUpdate(
        {username: name},
        { $addToSet: { tags: { $each: newTags } } },
        { new: true }
      )
      .then(result => {
        if (!result) return res.status(404).send(`No user found with the username ${user.username}`)
        
        res.status(200).json({
          message: `User ${result.username} found and updated`, 
          added: newTags,
          status: 200
        })
      }) 
  } catch (err) {
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
      res.status(403).json({
        message: `User ${user.username}, not able to edit ${name}'s tags`
      })
      return false
    }

    await userSchema
      .findOne(
        { username: name },
        { new: false }
      )
      .then(result => {
        if (!result) {
          return res.status(404).send(`No user found with the username ${user.username}`);
        }

        // Check if all tags in removeTags exist in the tags array
        const tagsExist = removeTags.every(tag => result.tags.includes(tag));

        if (!tagsExist) {
          res.status(400).json({
            message: `Not have every tag in [${removeTags}] exist in the user's tags`,
            removeTags: removeTags,
            status: 400
          });
          return false
        }

        let updatedUser = userSchema.findOneAndUpdate(
          { username: name },
          { $pull: { tags: { $in: removeTags } } },
          { new: true }
        );

        res.status(200).json({
          message: `User ${updatedUser.username} found and updated`,
          removed: removeTags,
          userTags: updatedUser.tags,
          status: 200
        });

        return true
      })
  } catch (err) {
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
    res.status(422).json({
      message: `Admin query needs to be set as boolean`
    })
    return false
  }

  let user = await getUserWithID(res, userID)

  if (!user.admin) {
    res.status(403).json({
      message: `User with id: ${userID} not allowed to promote users`
    })
    return false
  }

  try {

    await userSchema
      .findByIdAndUpdate(
        id, 
        { admin: admin },
        { new: true }
      )
      .then(user => {
        if (!user) return res.status(404).send(`No user found with the _id: ${id}`)
        let message =  admin ? `User ${user.username} found and given admin` : `User ${user.username} found and revoked admin`
        res.status(200).json({
          name: user.username, 
          id: user._id, 
          message: message, 
          status: 200
        })
      }) 
  } catch (err) {
    return next(err)
  }
})

/* ------------------------------- Delete user ------------------------------ */

//! UPDATE TO NEW DATABASE, NO LONGER USING AWS SERVER 
router.post("/delete/:userAuthID", async (req, res, next) => {
  const userAuthID = req.params.userAuthID
  const userID = req.query.userID

  let user = await getUserWithID(res, userID)

  if (!user.admin) {
    res.status(403).json({
      message: `User ${user.username} not allowed to delete users`
    })
  }

  try {
    const response = await fetch("http://54.176.161.136:8080/users/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicationId: appId, 
        ID: userAuthID
      })
    })

    const data = await response.json()

    if (data.status === 200) {
      await userSchema.deleteOne({userAuthID: userAuthID})
      res.status(200).json(data)
    } else {
      res.status(500).json({
        data,
        message: `Something went wrong`
      })
    }
  } catch(err) {
    next(err)
  }
})
//! ^^^^^^^^^^^^^^^^^^^^^^^^^^^ FIX ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/* -------------------------------------------------------------------------- */

module.exports = router