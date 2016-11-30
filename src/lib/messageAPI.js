'use strict'

import config from "../../config.json"
import _ from "lodash"
import seedrandom from "seedrandom"
import iconv from "iconv-lite"
import app from "./app"
require('date-utils')

function sendVerifyCode(mobile, res) {
  const rng = seedrandom(mobile)
  let random = rng()
  random = parseInt(random*10000)
  sendMessage(mobile, "欢迎注册sitv新视觉会员。您的验证码为：" + random)
  .then ( result => {
    return random
  })
  .catch ( err => {
    return -1
  })
}

function sendMessage (mobile, text) {
  const promise = new Promise( function(resolve, reject) {
    const request = require('request')
    const url = "http://sms.10690221.com:9011/hy/?uid=" + config.message_uid + "&auth=" + config.message_auth + "&mobile=" + mobile + "&msg=" + encodeURIComponent(text) + "&expid=0&encode=utf8"
    app.logger.info (url)
    request(url , function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        // we get error when getting token
        app.logger.error ('error=' + error + "| statusCode=" + response.statusCode)
        reject (error)
      }
    })
  });
  return promise
}


exports.send_VerifyCode = sendVerifyCode
