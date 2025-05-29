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

app.use(cors({
  origin: [
        'https://app.apiv.io',           // Your Cloudflare Pages domain
        'http://localhost:3000',        // For local development
        'http://localhost:5173',        // If using Vite
        'http://127.0.0.1:3000',        // Alternative localhost
    ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))
app.use(express.json())
app.use(healthCheckRouter)
// app.use(authVerify)
app.use(apiRouter)
app.use(scheduleRouter)

const PORT = process.env.PORT || 8000

app.listen(PORT,  () => {
    console.log(`Server Running on port: ${PORT}`)
})