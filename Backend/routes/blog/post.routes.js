const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary')
const filter = require('leo-profanity');


const { isValid_id, getUserWithID } = require("../routeMethods.js")

/* --------------------------- MongodDB Connection -------------------------- */

const blogDB = require('../../connections/chatDB.js')

/* ----------------------------- MongoDB schemas ---------------------------- */

let postSchema = require("../../models/blog/Post.js")
let commentSchema = require("../../models/blog/Comment.js")

// All posts start with /posts

/* ------------------------ Get all of a users posts ------------------------ */

router.get("/user/:username", async (req, res, next) => {
  const username = req.params.username;
  const page = parseInt(req.query.page) || 1
  const PAGE_SIZE = parseInt(req.query.size)

  try {
    const totalResults = await postSchema.countDocuments({ author: username })

    const results = await blogDB.model(postSchema.modelName)
      .find({ author: username })
      .skip((page - 1) * PAGE_SIZE) // Calculate how many documents to skip based on the page number
      .sort({ createdAt: -1 }) // Sort by date
      .limit(PAGE_SIZE) // Limit the number of documents per page

    let message = results.length === 0 ? 'No posts found from search' : 'Search results successfully fetched';

    res.status(200).json({
      data: results,
      count: results.length,
      currentPage: page,
      totalPosts: totalResults,
      totalPages: Math.ceil(totalResults / PAGE_SIZE),
      message: message,
      status: 200,
    })
  } catch (err) {
    next(err)
  }
});

/* ------------------- Search posts with title and content ------------------ */

router.get("/search", async (req, res, next) => { 
  const page = parseInt(req.query.page) || 1
  const PAGE_SIZE = parseInt(req.query.size)
  
  let query = req.query.query
  query = query === null ? "" : query
  const regex = new RegExp(query, 'i')
  
  try {PAGE_SIZE
    const searchQuery = {
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { author: { $regex: regex } }
      ]
    }

    const totalResults = await postSchema.countDocuments(searchQuery)

    const results = await postSchema
      .find(searchQuery)
      .skip((page - 1) * PAGE_SIZE) // Calculate how many documents to skip based on the page number
      .sort({ createdAt: -1 }) // Sort by _id (or any other field you want to sort by)
      .limit(PAGE_SIZE) // Limit the number of documents per page

    let message = results.length === 0 ? 'No posts found from search' : 'Search results successfully fetched';

    res.status(200).json({
      data: results,
      count: results.length,
      currentPage: page,
      totalPosts: totalResults,
      totalPages: Math.ceil(totalResults / PAGE_SIZE),
      message: message,
      status: 200,
    })
  } catch (err) {
    return next(err)
  }
})

/* -------------------------- Create post from form ------------------------- */

router.post("/create-post", async (req, res, next) => {
  try {
    req.body.content = filter.clean(req.body.content);
    req.body.title = filter.clean(req.body.title);
    const result = await blogDB.model(postSchema.modelName).create(req.body);
    res.status(201).json({
      data: result,
      message: "Data successfully uploaded",
      status: 200,
    })
  } catch (err) {
    return next(err)
  }
})

/* --------------------------- Get a post with _id -------------------------- */

router.get("/get-post/:id", async (req, res, next) => {
  const postID = req.params.id

  if (!await isValid_id(res, postID, postSchema)) return false
  
  try {
    await postSchema
    .findById(postID)
    .then((result) => {
      res.status(200).json({
        data: result,
        voteCount: result.voteCount,
        message: "Post successfully fetched",
        status: 200,
      })
    })
  } catch(err) {
      return next(err)
  }
})

/* --------------------------- Edit post with _id --------------------------- */

router.post("/edit-post/:id", async (req, res, next) => {
  const postID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, postID, postSchema)) return false

  try {
    const post = await postSchema.findById(postID);
    
    if (user.username !== post.author && !user.admin) {
      res.status(403).json({
        message: `User ${user.username} not authorized to edit ${post.author}'s post`
      })
      return false
    }

    req.body.content = filter.clean(req.body.content);
    req.body.title = filter.clean(req.body.title);

    await postSchema  
    .findByIdAndUpdate(postID, req.body, { new: true })
    .then(result => {
      res.status(200).json({
        data: result, 
        voteCount: result.voteCount,
        message: "Data successfully updated",
        status: 200
      })
    })
  } catch(err) {
    return next(err)
  }
})

/* -------------------------- Delete post with _id -------------------------- */

router.post("/delete-post/:id", async (req, res, next) => {
  const postID = req.params.id
  const userID = req.query.userID

  const user = await getUserWithID(res, userID)

  if (!await isValid_id(res, postID, postSchema)) return false
  
  try {
    const post = await postSchema.findById(postID)

    if (user.username !== post.author && !user.admin) {
      res.status(403).json({
        message: `User ${user.username} not authorized to delete ${post.author}'s post`
      })
      return false
    }

    const deletePromises = [
      postSchema.findByIdAndRemove(postID),
      commentSchema.deleteMany({ postID: postID })
    ]
    
    if (post.imageUrl) {
      const publicId = post.imageUrl.split('/').pop().split('.')[0]
      await cloudinary.v2.api.delete_resources(
        [`BlogImages/${publicId}`], 
        { type: 'upload', resource_type: 'image' }
      )
    }
    
    await Promise.all(deletePromises)

    res.status(200).json({
      message: `All info related to post: ${postID} has been deleted`,
    })
  } catch (err) {
    return next(err)
  }
})

/* -------------------------------------------------------------------------- */

module.exports = router
