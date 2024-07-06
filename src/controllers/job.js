// const sgMail = require('@sendgrid/mail')
const postmark = require("postmark");

const agenda = require("../agenda")
const Schedule = require("../models/schedules")
const axios = require("axios")

const admin = require('../middleware/firebaseAdmin')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
var postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

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
        const template = {
            "From": "app-scheduler@apiv.io",
            "To": "support@apiv.io",
            "TemplateAlias": "scheduler-notif-template",
            "TemplateModel": {
              "api_url": apiUrl,
              "api_ran_at": ranAt,
              "api_status":log.status,
              "json_logs": JSON.stringify(log.response, null, 2),
              "api_next_run": nextRun,
              "api_name": apiName
            }
        }
        
        postmarkClient.sendEmailWithTemplate(template).then(() => {}, error => {
            console.error(error);
        
            if (error.response) {
              console.error(error.response.body)
            }
        })
    }
}

const updateSchedule = async (data) => {
    const { status , job, apiResponse, apiError, ranAt } = data
    try {
        const reqSchedule = await Schedule.findOne({_id: job.attrs?.data?.savedScheduleId, user: job.attrs?.data?.user})
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
        
        reqSchedule['apiResponse'] = [...reqSchedule['apiResponse'], responseObj]

        sendMail({
            apiName: reqSchedule.name, 
            apiUrl: reqSchedule.apiUrl, 
            log: responseObj, 
            ranAt, 
            nextRun: job.attrs?.nextRunAt,
            userId: job.attrs?.data?.user
        })

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