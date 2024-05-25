const dotenv = require('dotenv').config()
const express = require('express')
const server = express()
var cors = require('cors')

const apiRouter = require("./routers/apis")
const scheduleRouter = require("./routers/schedules")
const healthCheckRouter = require("./routers/healthcheck")
const authVerify = require("./middleware/authVerify")

require("./db")
require("./agenda")

server.use(cors())
server.use(express.json())
server.use(healthCheckRouter)
server.use(authVerify)
server.use(apiRouter)
server.use(scheduleRouter)

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
    console.log(`Server Running on port: ${PORT}`)
})