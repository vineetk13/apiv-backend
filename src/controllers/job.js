const sgMail = require('@sendgrid/mail')
const agenda = require("../agenda")
const Schedule = require("../models/schedules")
const axios = require("axios")

const admin = require('../middleware/firebaseAdmin')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (data) => {
    const { apiName, apiUrl, log, ranAt, nextRun, userId } = data

    let userEmail = ''
    try {
        const user = await admin.auth().getUser(userId)
        userEmail = user.email

    } catch(e) {
        console.error('Unable to send job complete mail: ', e)
    }
    if (userEmail) {
        const msg = {
            to: userEmail,
            from: 'scheduler@apiv.io',
            templateId: 'd-f63f0606c9c7433084e2f0b1da7f2e51',
            dynamicTemplateData: {
                api_name: apiName,
                json_logs: JSON.stringify(log.response),
                api_url: apiUrl,
                api_ran_at: ranAt,
                api_status: log.response,
                api_next_run: nextRun
            },
        }
        sgMail.send(msg)
    }
}

const updateSchedule = async (data) => {
    const { status , job, apiResponse, apiError, ranAt } = data
    console.log('----- update schedule data: ', apiRespose?.data, apiResponse?.status)
    try {
        const reqSchedule = await Schedule.findOne({_id: data.savedScheduleId, user:data.user})
        let responseObj = {}
        if(status === 'SUCCESS') {
            reqSchedule['status'] = 'API_SUCCESS'
            responseObj = {
                response: apiResponse?.data ?? {},
                status: apiResponse?.status ?? 0,
                ranAt: ranAt
            }
        } else {
            reqSchedule['status'] = 'API_FAILED'
            const responseObj = {
                response: apiError?.response?.data ?? {},
                status: apiError?.response?.status ?? 0,
                ranAt: ranAt
            }
        }
        console.log('------- UPDATED schedule 1: ', reqSchedule)

        
        reqSchedule['apiResponse'] = reqSchedule['apiResponse'].push(responseObj)

        sendMail({
            apiName: reqSchedule.name, 
            apiUrl: reqSchedule.apiUrl, 
            log: responseObj, 
            ranAt, 
            nextRun: job.attrs.nextRunAt,
            userId: data.user 
        })

        console.log('------- UPDATED schedule 2: ', reqSchedule)

        reqSchedule.save()
    } catch (e) {
        console.log('Error updating apiResponse for job: ', job.attrs._id, e)
    }
}


const defineJob = (jobName) => {
    agenda.define(jobName, async (job) => {
        console.log('HANDLER JOB: ', job.attrs)
        const { data } = job.attrs
        if (data) {
            try {
                const ranAt = new Date()
                const apiResponse = await axios({
                    url: data.apiUrl,
                    method: data.method,
                    headers: data.headers,
                    data: data.body ? JSON.parse(data.body) : undefined
                })
                // console.log(`----- API response for job ${job.attrs._id}: `, apiResponse)
                
                updateSchedule({status: 'SUCCESS', job, apiResponse, ranAt})


            } catch(apiError) {
                console.log(`----- API ERROR for job ${job.attrs._id}: `, apiError)

                updateSchedule({status: 'FAILED', job, apiError, ranAt})
            }
        }

    })
}

module.exports = { defineJob }