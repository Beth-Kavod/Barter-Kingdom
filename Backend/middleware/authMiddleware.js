const User = require('../models/user/User')
const jwt = require('jsonwebtoken')
require('dotenv').config

/* -------------- Checks the currently logged in users cookies -------------- */

const authMiddleware = async (req, res, next) => {
  const userCookies = req.cookies.user

  if (!userCookies) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized cookies"
    })
  }

  try {
    const decoded = await jwt.verify(userCookies, process.env.SECRET_KEY)

    const foundUser = await User.findOne({ userAuthID: decoded.userAuthID })

    if (!foundUser) {
      return res.json({ 
        success: false,
        message: "No user with that ID found"
      })
    }

    const { username, walletAddress, userAuthID, avatar } = foundUser

    return res.json({
      success: true,
      message: `User verified with cookies`,
      user: {
        username,
        walletAddress,
        avatar,
        userAuthID,
      } 
    })

  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Unauthorized cookies",
      error: `Error occurred parsing cookies: ${err.message}`
    })    
    return next(err)
  }
}


module.exports = authMiddleware