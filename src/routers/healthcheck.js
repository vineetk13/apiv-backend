const express = require("express")

const router = express.Router()

router.get("/health", (req, res) => {
    console.log("HEALTH CHECK -------")
    res.status(200).send({status: 'ok'})
})

module.exports = router