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

router.get('/redirect', (req, res) => {
  const wei = req.query.wei
  if (wei === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    memberAPI.redirect_page(wei, res)
  }
})

router.get('/userinfo', (req, res) => {
  const key = req.query.key
  const wei = req.query.wei
  const code = req.query.code
  if (key !== config.wechat_access_key || wei === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    memberAPI.get_accessKey(wei, code)
    .then ( access_token => {
      memberAPI.get_OpenID(wei, code)
      .then ( open_ID => {
        app.logger.info ("access_token = " + access_token + " | open_ID = " + open_ID)
        memberAPI.get_UserInfo(access_token, open_ID)
        .then ( result => {
          res.statusCode = 200
          res.set("Content-Type","application/json;charset=utf-8")
          res.json(result)
        })
        .catch (err => {
          show400(err)
        })
      })
      .catch (err => {
        show400(err)
      })
    })
    .catch (err => {
      show400(err)
    })
  }
})

function show400(message) {
  app.logger.error(message)
  res.status(400).json({ "error": "Infonation you provided is incorrect!" })
}
