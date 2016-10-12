'use strict'

import config from "../../config.json"
import keysConfig from "../../data/keys.json"
import app from "./app"
import cacheBox from "./cacheBox"
import _ from "lodash"
require('date-utils')

function findInCache (key){
  return cacheBox.getCached(key)
  // // get access token with selected key
  // const curentKey = _.findLastIndex(cachedKeys, function (current){
  //   return current.name === key
  // })
  //
  // // we cannot find current access token in cache
  // if (curentKey === -1)  {
  //   return null
  // // the acess tokken we saved in chache is expired
  // } else if ( Date.compare(cachedKeys[curentKey].expires_in, new Date()) < 0 ) {
  //   _.remove(cachedKeys, function(o){
  //     o.name === key
  //   })
  //   return null
  // // we can use saved cache
  // } else {
  //   return cachedKeys[curentKey]
  // }
}

// this used to find api settings of certain weixin account in list
function findKey (key){
  //Get key of cached access token
  const found =  _.findLastIndex(keysConfig, function (o) {
    return o.name === key;
  })
  return found >=0 ? keysConfig[found] : null
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

exports.get_accessKey = getAccessKey
