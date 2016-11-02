import app from "./lib/app"
import express from "express"
import cookie from "cookie-parser"
import bodyParser from "body-parser"
import path from "path"
import config from "../config.json"
import memberRoute from "./lib/memberRoute.js"
import winston  from "winston"
import cors from "cors"
import pack from "../package.json"

app.logger = new winston.Logger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: path.join(__dirname, '../log') })
  ]
});

app.use(cookie())
app.use(bodyParser())
// define the wechat shock service
app.use("/member", memberRoute)

app.use("/", (req, res) => {
    res.send("Wexin member mamager system service.<br>Current Version: " +  pack.version + "<br>Author: " + pack.author)
  })

// We will return null for other locations
app.use(async (req, res) => {
  res.statusCode = 404
  res.end("there is no service here!")
})

const server = app.listen(config.port, function (error) {
  if (!error) {
    app.logger.info('Listening on port %d', server.address().port)
  }
  else {
    app.logger.error(error)
  }
})
