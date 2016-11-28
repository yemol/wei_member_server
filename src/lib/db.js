'use strict'

import { configuration, mysqlAdapter } from "simple-mysql-delegate"
import config from "../../config.json"

configuration.connection = config.mysqlconnect
configuration.userID = config.mysqlUserID
configuration.password = config.mysqlPassword
configuration.databaseName = config.databaseName

module.exports = new mysqlAdapter(configuration)
