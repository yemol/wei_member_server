'use strict'

import express from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import config from "../../config.json"
import pack from "../../package.json"
import app from "./app"
import tool from "./tool.js"
import memberAPI from "./memberAPI.js"


const router = express.Router()
// we will export router here
module.exports = router


// Get access token for different wexin account for member system
router.get('/access_key', (req, res) => {
  const key = req.query.key
  const wei = req.query.wei
  if (key !== config.wechat_access_key || wei === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    // we have got token
    memberAPI.get_accessKey(wei)
    .then ( result => {
      // we will return 200 status if we saved operation log into database
      res.statusCode = 200
      res.set("Content-Type","application/json;charset=utf-8")
      res.json({"access_token": result})
    })
    .catch (err => {
      // we will return 400 status if we cannot save operation log into database
      app.logger.error(err)
      res.status(400).json({ "error": "Infonation you provided is incorrect!" })
    })
  }
})
