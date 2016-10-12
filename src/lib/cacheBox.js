import _ from "lodash"

let cachebox = []

exports.cache = function (key, data, expired) {
  if (cachebox[key] !== null && cachebox[key] !== undefined) {
    cachebox[key].data = data
    cachebox[key].expired = expired
  } else {
    const save = {}
    save.expired = expired
    save.data = data
    cachebox[key] = save
  }
}

exports.getCached = function (key) {
  if (cachebox[key] !== null && cachebox[key] !== undefined) {
    if ( Date.compare(cachebox[key].expired,  _.now()) > 0 ) {
      return cachebox[key]
    } else {
      cachebox[key] = null
      return cachebox[key]
    }
  } else {
    return null
  }
}
