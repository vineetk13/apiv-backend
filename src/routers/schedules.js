const express = require("express")
const Schedule = require("../models/schedules")
const AgendaJob = require("../models/agendaJob")
const authVerify = require("../middleware/authVerify")
const apivJobs = require("../controllers/job")
const agenda = require("../agenda")
const createSchedule = require("../controllers/schedule")

const router = express.Router()

router.post("/schedules", authVerify, async (req, res) => {
    const newSchedule = Schedule({...req.body, status: 'PENDING'})
    const isImmediateSchedule = req.body.immediate ? true : false

    // if (isImmediateSchedule) {
    //     if (req.body.immediate <= new Date().toISOString()) {
    //         return res.status(400).send("Immediate schedule cannot be prior to current time")
    //     }
    // }
    
    try {
        const savedSchedule = await newSchedule.save()
        console.log('------ SAVED SCHEDULKE: ', savedSchedule)
        res.status(201).send(newSchedule)
        try {
            apivJobs.defineJob("schedule-api")
            if (isImmediateSchedule){
                await createSchedule.scheduleApi({...req.body, savedScheduleId: savedSchedule._id})
            } else {
                await createSchedule.recurringScheduleApi({...req.body, savedScheduleId: savedSchedule._id})
            }
        } catch(e) {
            console.log('------ SCHEDULING ERROR!!', e)
        }
    } catch(e) {
        console.log('Error creating new schedule: ', e)
        res.status(400).send(e)
    }
})

router.put("/schedules/:id", authVerify, async (req, res) => {
    const scheduleId = req.params.id
    const updates = Object.keys(req.body).filter((item) => item !== 'user' && item !== 'jobId')
    const validUpdates = ["status"]
    const isValidOperation = updates.every((u) => validUpdates.includes(u))

    if(!isValidOperation){
        return res.status(400).send({error: "Invalid updates"})
    }

    try{
        const reqSchedule = await Schedule.findOne({_id: scheduleId, user: req.body.user})
        if(!reqSchedule){
            res.status(404).send()
        }

        updates.forEach((update) => reqSchedule[update] = req.body[update])

        try {
            await agenda.disable({ _id: req.body.jobId })
        } catch(e) {
            console.log('------- SCHEDULE JOB DISABLE ERROR: ', e)
            res.status(500).send()
        }
        try {
            await reqSchedule.save()
            res.send(reqSchedule)
        } catch(e) {
            console.log('------- SCHEDULE PUT ERROR: ', e)
            res.status(500).send()
        }
    }
    catch(e) {
        res.status(500).send()
    }
})

router.get("/schedules", authVerify, async (req, res) => {
    try {
        const schedules = await Schedule.find({user: req.body.user}).populate({path: 'scheduleId', model: AgendaJob}).exec()
        console.log('------ SCHEDULES: ', schedules)
        res.status(200).send(schedules)
    } catch(e) {
        console.log('GET SCHEDULES ERROR: ', e)
        res.status(400).send(e)
    }
})

module.exports = router