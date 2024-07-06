const express = require("express")
const Api = require("../models/apis")
const authVerify = require("../middleware/authVerify")

const router = express.Router({strict: true})

router.post("/apis", authVerify, (req, res) => {
    const newApi = Api({...req.body})

    newApi.save()
        .then(() => res.status(201).send(newApi))
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.get("/apis/:id", authVerify, async (req, res) => {
    const apiId = req.params.id
    try{
          const reqApi = await Api.findOne({_id:apiId, user:req.body.user})
          if(!reqApi){
                res.status(404).send()
          }
          res.send(reqApi)
    }
    catch(e){
          res.status(500).send()
    }
})

router.get("/apis", authVerify, async (req, res) => {
    console.log("GET /apis....")
    try {
        const apis = await Api.find({user: req.body.user})
        console.log('RESULT: ', apis)
        res.status(200).send(apis)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.put("/apis/:id", authVerify, async (req, res) => {
    const apiId = req.params.id
    const updates = Object.keys(req.body).filter((item) => item !== 'user')
    const validUpdates = ["url", "method", "headers", "body"]
    const isValidOperation = updates.every((u) => validUpdates.includes(u))
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid updates"})
    }
    try{
            const reqApi = await Api.findOne({_id:apiId, user:req.body.user})
            if(!reqApi){
                res.status(404).send()
            }

            updates.forEach((update) => reqApi[update] = req.body[update])
            try {
                await reqApi.save()
                res.send(reqApi)
            } catch(e) {
                res.status(500).send()
            }
    }
    catch(e){
        res.status(500).send()
    }
})

router.delete("/apis/:id", authVerify, async (req, res) => {
    const apiId = req.params.id
    try{
          const deletedApi = await Api.findByIdAndDelete({_id:apiId, user:req.body.user})

          if(!deletedApi){
                res.status(404).send({error:"Not found"})
          }
          res.status(200).send(deletedApi)
    }
    catch (e){
          res.status(500).send(e)
    }
})

module.exports = router
