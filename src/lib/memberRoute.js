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
import MemberDB from "./memberDB.js"
import messageAPI from "./messageAPI.js"

const router = express.Router()
// we will export router here
module.exports = router
// support cross domain request
router.use(cors())

// This path is used to nav user to login page
// we will use diret paramtes to check if this redirect is for sitv or other wei account.
router.get('/verify_user', (req, res) => {
  const mobile = req.query.mobile
  const key = req.query.key
  if (key !== config.wechat_access_key || mobile === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    if (mobile === undefined) {
      res.statusCode = 401
      res.end ("Unauthorized!")
      return
    } else {
      const code = messageAPI.send_VerifyCode(mobile)
      res.set("Content-Type","text/plain;charset=utf-8")
      res.statusCode = 200
      res.end(code)
    }
  }
})

// This path is used to nav user to login page
// we will use diret paramtes to check if this redirect is for sitv or other wei account.
router.get('/user_service', (req, res) => {
  const wei = req.query.wei
  if (wei === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    memberAPI.start_Login(wei, true, res)
  }
})

// This path is used to nav user to login page
// we will use diret paramtes to check if this redirect is for sitv or other wei account.
router.get('/user_subscribe', (req, res) => {
  const wei = req.query.wei
  if (wei === undefined) {
    res.statusCode = 401
    res.end ("Unauthorized!")
    return
  } else {
    memberAPI.start_Login(wei, false, res)
  }
})

// This method is used to get user info
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
        memberAPI.get_UserInfo(access_token, open_ID)
        .then ( result => {
          // we will return registered user info if checking service wei account.
          if (wei === config.service_wexin_account) {
            new MemberDB().selectOne(result.openid, (error, member) => {
              app.logger.info (member)
              res.statusCode = 200
              res.set("Content-Type","application/json;charset=utf-8")
              res.json({
                'openid': result.openid,
                'registered': result.openid === member.openid,
                'nickname': member.nickname,
                'sex': member.sex,
                'headimgurl': member.headimgurl
              })
            })
          } else {
            app.logger.info (result)
            // we just return weixin account info here.
            res.statusCode = 200
            res.set("Content-Type","application/json;charset=utf-8")
            res.json(result)
          }
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
