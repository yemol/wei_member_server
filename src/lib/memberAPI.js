'use strict'

import config from "../../config.json"
import keysConfig from "../../data/keys.json"
import app from "./app"
import cacheBox from "./cacheBox"
import _ from "lodash"
require('date-utils')

// This method is used to get cached access token.
function findInCache (key){
  return cacheBox.getCached(key)
}

// this used to find api settings of certain weixin account in list
function findKey (key){
  //Get key of cached access token
  const found =  _.findLastIndex(keysConfig, function (o) {
    return o.name === key;
  })
  return found >=0 ? keysConfig[found] : null
}

function redirect_page(key, isDirect, res){
  const keysetting = isDirect ? findKey(key) : findKey('sitv')
  console.log (keysetting)
  if(keysetting === null ) {
    res.sendStatus(404)
  } else {
    if (isDirect) {
      res.redirect(301, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5aa86e7885f60a8a&redirect_uri=http%3A%2F%2Fhuiyuan.gamefy.cn%2Fstatic%2FgetUserinfo.js&response_type=code&scope=snsapi_base&state=' + key + '#wechat_redirect')
    } else {
      // 如果不是互动的账号，就会进入用户信息取得流程。用来取得用户的具体信息。
      res.redirect(301, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5aa86e7885f60a8a&redirect_uri=http%3A%2F%2Fhuiyuan.gamefy.cn&response_type=code&scope=snsapi_base&state=' + key + '#wechat_redirect')
    }
  }
}


function getAccessKey (key) {
  const promise = new Promise( function(resolve, reject) {
    const token = findInCache(key)
    if ( token === null ) {
      // we have to reload token
      const keysetting = findKey(key)
      // we will not do anthing if we cannot get api setting
      if(keysetting === null ) reject(null)
      // get access token
      const request = require('request')
      const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + keysetting.appID + '&secret=' +  keysetting.appsecret
      request(url , function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const result = JSON.parse(body)
          if (result.access_token) {
            cacheBox.cache (key, result.access_token, new Date().add({ "seconds": (result.expires_in - 600) }))
            resolve(result.access_token)
          } else {
            // we failed getting token
            reject (result)
          }
        } else {
          // we get error when getting token
          app.logger.error ('error=' + error + "| statusCode=" + response.statusCode)
          reject (error)
        }
      })
    } else {
      // using saved token
      resolve(token.data)
    }
  });
  return promise
}

function getOpenID (key, code) {
  const promise = new Promise( function(resolve, reject) {
    // get api setting
    const keysetting = findKey(key)
    // we will not do anthing if we cannot get api setting
    if(keysetting === null ) reject(null)
    // get open id
    const request = require('request')
    const url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + keysetting.appID + '&secret=' +  keysetting.appsecret + '&code=' + code + '&grant_type=authorization_code'
    request(url , function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const result = JSON.parse(body)
        if (result.openid) {
          // return openid & access_token
          resolve(result.openid)
        } else {
          // we failed getting token
          reject (result)
        }
      } else {
        // we get error when getting token
        app.logger.error ('error=' + error + "| statusCode=" + response.statusCode)
        reject (error)
      }
    })
  });
  return promise
}

function getUserInfo (access_token, openid) {
  const promise = new Promise( function(resolve, reject) {
    const request = require('request')
    const url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN'
    request(url , function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const result = JSON.parse(body)
        if (result.openid) {
          resolve(result)
        } else {
          // we failed getting token
          reject (result)
        }
      } else {
        // we get error when getting token
        app.logger.error ('error=' + error + "| statusCode=" + response.statusCode)
        reject (error)
      }
    })
  });
  return promise
}

exports.get_UserInfo = getUserInfo
exports.get_OpenID = getOpenID
exports.get_accessKey = getAccessKey
exports.redirect_page = redirect_page
