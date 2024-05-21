const express = require("express")
const axios = require("axios")
const Schedule = require("../models/schedules")
const authVerify = require("../middleware/authVerify")
const agenda = require("../agenda")

const router = express.Router()

const defineJob = (jobName) => {
    agenda.define(jobName, async (job) => {
        console.log('HANDLER JOB: ', job.attrs)
        const { data } = job.attrs
        if (data) {
            try {
                const apiResponse = await axios({
                    url: data.apiUrl,
                    method: data.method,
                    headers: data.headers,
                    data: JSON.parse(data.body)
                })
                console.log(`----- API response for job ${job.attrs._id}: `, apiResponse)
                try {
                    const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
                    reqSchedule['status'] = 'sucess'
                    reqSchedule['apiResponse'] = apiResponse
                    reqSchedule.save()
                } catch (e) {
                    console.log('Error updating apiResponse for job: ', job.attrs._id, e)
                }

            } catch(apiError) {
                console.log(`----- API ERROR for job ${job.attrs._id}: `, apiError.response)
                try {
                    const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
                    reqSchedule['status'] = 'sucess'
                    reqSchedule['apiError'] = apiError.response
                    reqSchedule.save()
                } catch (e) {
                    console.log('Error updating apiError for job: ', job.attrs._id, e)
                }
            }
        }

    })
}

async function scheduleApi(data) {
    const job = await agenda.schedule(data.immediate, "schedule-api", data)
    console.log('SCHEDULED JOB: ', job)
    try {
        const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
        reqSchedule['status'] = 'scheduled'
        reqSchedule['scheduleId'] = job.attrs._id
        reqSchedule.save()
    } catch (e) {
        console.log('Error updating schedule status for job: ', job.attrs._id, e)
    }
}

router.post("/schedules", authVerify, async (req, res) => {
   
    const newSchedule = Schedule({...req.body, status: 'pending'})
    
    try {
        const savedSchedule = await newSchedule.save()
        console.log('------ SAVED SCHEDULKE: ', savedSchedule)
        res.status(201).send(newSchedule)
        try {
            defineJob("schedule-api")
            await scheduleApi({...req.body, savedScheduleId: savedSchedule._id})
        } catch(e) {
            console.log('------ SCHEDULING ERROR!!', e)
        }
    } catch(e) {
        res.status(400).send(err)
    }            
})

router.get("/schedules", authVerify, async (req, res) => {
    try {
        const schedules = await Schedule.find({user: req.body.user})
        res.status(200).send(schedules)
    } catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router