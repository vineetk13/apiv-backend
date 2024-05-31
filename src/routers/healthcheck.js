const express = require("express")

const router = express.Router()

const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime % 60)
    const minutes = Math.floor((uptime / 60) % 60)
    const hours = Math.floor((uptime / 3600) % 24)
    const days = Math.floor(uptime / (3600 * 24))
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

router.get("/health", (req, res) => {
    console.log("------- HEALTH CHECK -------")
    const uptime = process.uptime()
    res.status(200).send({
        status: 'ok',
        uptime: formatUptime(uptime),
        timestamp: new Date()
    })
})

module.exports = router