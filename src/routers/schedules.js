const express = require("express")
const axios = require("axios")
const Schedule = require("../models/schedules")
const authVerify = require("../middleware/authVerify")
const agenda = require("../agenda")
const helpers = require("../helpers")

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
                    data: data.body ? JSON.parse(data.body) : undefined
                })
                console.log(`----- API response for job ${job.attrs._id}: `, apiResponse.data)
                try {
                    const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
                    reqSchedule['status'] = 'API_SUCCESS'
                    reqSchedule['apiResponse'] = apiResponse.data
                    reqSchedule['apiResponseStatus'] = apiResponse.status
                    reqSchedule.save()
                } catch (e) {
                    console.log('Error updating apiResponse for job: ', job.attrs._id, e)
                }

            } catch(apiError) {
                console.log(`----- API ERROR for job ${job.attrs._id}: `, apiError)
                try {
                    const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
                    reqSchedule['status'] = 'API_FAILED'
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
        reqSchedule['status'] = 'SCHEDULED'
        reqSchedule['scheduleId'] = job.attrs._id
        reqSchedule.save()
    } catch (e) {
        console.log('Error updating schedule status for job: ', job.attrs._id, e)
    }
}

async function recurringScheduleApi(data) {
    const hours = data.recurring.time.split(":")[0]
    const mins = data.recurring.time.split(":")[1]
    const date = data.recurring.date
    const days = data.recurring.days ?? []
    let cronString = ''
    if (date) {
        cronString = `${mins} ${hours} ${date} * *`
    } else {
        const daysValue = helpers.weekdaysToCronStringWithRanges(days)
        cronString = `${mins} ${hours} * * ${daysValue}`
    }
    const job = await agenda.every(cronString, "schedule-api", data, {
        timezone: data.timezone,
        skipImmediate: true,
        startDate: data.recurring.from,
        endDate: data.recurring.to
    })  
    
    console.log('RECURRING SCHEDULED JOB: ', job)
    try {
        const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
        reqSchedule['status'] = 'SCHEDULED'
        reqSchedule['scheduleId'] = job.attrs._id
        reqSchedule.save()
    } catch (e) {
        console.log('Error updating schedule status for job: ', job.attrs._id, e)
    }
}



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
            defineJob("schedule-api")
            if (isImmediateSchedule){
                await scheduleApi({...req.body, savedScheduleId: savedSchedule._id})
            } else {
                await recurringScheduleApi({...req.body, savedScheduleId: savedSchedule._id})
            }
        } catch(e) {
            console.log('------ SCHEDULING ERROR!!', e)
        }
    } catch(e) {
        console.log('Error creating new schedule: ', e)
        res.status(400).send(e)
    }
})

router.get("/schedules", authVerify, async (req, res) => {
    try {
        const schedules = await Schedule.find({user: req.body.user}).populate('scheduleId', "-__v").select("-__v")
        res.status(200).send(schedules)
    } catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router