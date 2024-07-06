const agenda = require("../agenda")
const Schedule = require("../models/schedules")
const helpers = require("../helpers")

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

module.exports = { scheduleApi, recurringScheduleApi }