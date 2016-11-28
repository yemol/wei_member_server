'use strict'

import app from "./app.js"
import _ from "lodash"
import db  from "./db.js"


export default class Member {
  constructor () {
    this.openid = ""
    this.phone = ""
    this.password = ""
    this.nickname = ""
    this.sex = 0
    this.language = ""
    this.city = ""
    this.province = ""
    this.country = ""
    this.headimgurl = ""
    this.lastlogin = ""
  }

  showMe () {
    return  `openid = ${this.openid}, phone = ${this.phone}, nickname = ${this.nickname}, sex = ${this.sex}, language = ${this.language}, city = ${this.city}, province = ${this.province}, country = ${this.country}, headimgurl = ${this.headimgurl}, lastlogin = ${this.lastlogin}`
  }

  fill (row, member) {
    try {
      if (row !== null && row !== undefined) {
        member = new Member()
        member.openid = row.openid
        member.phone = row.phone
        member.password = row.password
        member.nickname = row.nickname
        member.sex = row.sex
        member.language = row.language
        member.city = row.city
        member.province = row.province
        member.country = row.country
        member.headimgurl = row.headimgurl
        member.lastlogin = row.lastlogin
        app.logger.info ("Member.fill: " + member.showMe())
      }
    } catch (e) {
      app.logger.error("Member.fill: Fill data error. Error is [" + e + "] data is [" + member.showMe() + "]")
    } finally {
      return member
    }
  }

  addOne (member, done) {
    app.logger.info("Member.addOne: " + member.showMe())
    db.insert("member",
                [ "openid", "phone", "password","nickname","sex","language","city","province","country","headimgurl","lastlogin" ],
                [ member.openid, member.phone, member.password, member.nickname, member.sex, member.language, member.city, member.province, member.country, member.headimgurl, member.lastlogin ])
    .then( value => {
      return done(null, db.getInsertedID(value))
    })
    .catch ( error => {
      app.logger.error("Member.addOne: " + error)
      return done(error, null)
    })
  }

  // This method is used to retrive a user info from its open id.
  // We will return an empty member object if we did not find certain user.
  // So we have to check the openid of return member to see if we find the user info.
  selectOne (openid, done) {
    app.logger.info("Member.selectOne: Openid is" + openid)
    db.query("SELECT * FROM sitv.member where member.openid = " + db.escape(openid) + ";")
    .then( value => {
      app.logger.info(value)
      if (value.length >= 1){
        this.openid = value[0].openid
        this.phone = value[0].phone
        this.password = value[0].password
        this.nickname = value[0].nickname
        this.sex = value[0].sex
        this.language = value[0].language
        this.city = value[0].city
        this.province = value[0].province
        this.country = value[0].country
        this.headimgurl = value[0].head
        this.lastlogin = value[0].lastlogin
      }
      console.log (this)
      return done(null, this)
    })
    .catch ( error => {
      app.logger.error("Member.selectOne: " + error)
      return done(error, null)
    })
  }
}
