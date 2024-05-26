const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
var cors = require('cors')

const apiRouter = require("./routers/apis")
const scheduleRouter = require("./routers/schedules")
const healthCheckRouter = require("./routers/healthcheck")
const authVerify = require("./middleware/authVerify")

require("./db")
require("./agenda")

app.use(cors())
app.use(express.json())
app.use(healthCheckRouter)
// app.use(authVerify)
app.use(apiRouter)
app.use(scheduleRouter)

const PORT = process.env.PORT || 8000

app.listen(PORT,  () => {
    console.log(`Server Running on port: ${PORT}`)
})