const express = require("express")

const router = express.Router({strict: true})

router.get("/health", (req, res) => {
    res.status(200).send(JSON.stringify({status: 'ok'}))
})

module.exports = router