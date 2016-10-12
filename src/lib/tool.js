'use strict'

import crypto from "crypto"
import config from "../../config.json"
import path from "path"
import fs from "fs"

function sendJsonResult (result, res){
  res.statusCode = 200
  res.set("Content-Type","application/json;charset=utf-8")
  res.end(result)
}

// This method is used to get a json file and send it back.
// The file will be cached in caches array in memmory.
const caches = []
exports.getFile = function (req, res, location) {
  let result = "";
  if (caches[req.path]){
    sendJsonResult(caches[req.path], res)
  } else {
    const stream = fs.createReadStream(location);
    stream.on("data", function (trunk){
      result += trunk;
    });
    stream.on("end", function () {
      caches[req.path] = result
      sendJsonResult(result, res)
    });
  }
}

// This method is used to check if an object is contained in certain array.
exports.contains =  function (a, obj) {
  for (var i = 0; i < a.length; i++) {
      if (a[i] === obj) {
          return true;
      }
  }

  return false;
}
