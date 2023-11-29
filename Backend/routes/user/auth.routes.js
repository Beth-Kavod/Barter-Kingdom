const Router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/user/User')

// const authMiddleware = require('../../middleware/authMiddleware')
const { getUserWithID, hashPassword, generateUserAuthID } = require('../routeMethods.js')

const { SECRET_KEY } = process.env

// All auth routes start with /auth

/* --------------------------- Register a new user -------------------------- */

Router.post('/register', async (req, res, next) => {
  let {username, password, email, tribe, walletAddress } = req.body
  let hashedPassword, token 

  try {
    try {
      hashedPassword = await hashPassword(password)
    } catch (err) {
      throw new Error(`Error hashing password: ${err.message}`)
    }

    const userAuthID = generateUserAuthID()

    const data = await User.create({
      username: username, 
      email: email || "",
      password: hashedPassword,
      userAuthID: userAuthID, 
      walletAddress: walletAddress,
      tribe: tribe,
      admin: false,
      bio: "",
      avatar: ""
    })
    .then(newUser => {
      const payload = { 
        userAuthID: newUser.userAuthID,
        username: newUser.username,
        walletAddress: newUser.walletAddress
      }

      token = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "1d",
      })
    })
    
    res.cookie("user", token, {
      withCredentials: true,
      httpOnly: false
    })

    res.status(201).json({
      success: true,
      message: `Creation of user "${username}" successful`,
      user: data
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `Error when registering user`,
      error: err.message
    })
    return next(err)
  }
})

/* ------------------------------ Login a user ------------------------------ */

Router.post('/login', async (req, res, next) => {
  try {

    const { username, password } = req.body
    
    await User
      .findOne({ username: username })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect username or password'
          })
        }

        const passwordCorrect = bcrypt.compareSync(password, user.password)

        if (!passwordCorrect) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect username or password'
          })
        }

        const { username, userAuthID, walletAddress, avatar, tribe } = user

        const payload = { 
          username, 
          userAuthID, 
          walletAddress, 
          avatar, 
          tribe
        }
        
        let token = jwt.sign(payload, SECRET_KEY, {
          expiresIn: '1d'
        })

        res.cookie('user', token, {
          withCredentials: true,
          httpOnly: false 
        })

        res.status(200).json({
          success: true,
          message: `User ${username} logged in successfully`
        })
      })
  } catch(err) {
    res.status(500).json({
      success: false,
      message: `Error when logging in user`,
      error: err.message
    })
    return next(err)
  }
})

/* ------------------------------ Logout a user ----------------------------- */

Router.post('/logout', async (req, res, next) => {
  try {
    if (!req.cookies.user) {
      return res.status(400).json({
        success: false, 
        message: 'User not logged in'
      }) 
    }

    res.clearCookie('user')
    res.status(200).json({
      success: true,
      message: `User logged out`
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something went wrong logging user out`,
      error: err.message
    })
    return next(err)
  }
})

/* --------------------------- Verify user cookie --------------------------- */

Router.post('/protected', (req, res) => {
  try {
    const token = req.cookies.user;
    
    // Check if the user is authenticated
    if (token === undefined || token === null) {
      return res.status(400).json({ success: false, message: 'No cookie found' });
    }

    try {
      // Verify the JWT
      const decoded = jwt.verify(token, SECRET_KEY);
      // The JWT is valid, and the user is authenticated
      res.status(200).json({ 
        success: true, 
        message: `User authenticated`,
        userAuthID: decoded.userAuthID 
      });
    } catch (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized', 
        error: err.message
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something went wrong in retrieving cookies`,
      error: err.message
    })
    return next(err)
  }
});



module.exports = Router