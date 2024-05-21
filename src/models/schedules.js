const mongoose = require("mongoose")

const scheduleSchema = new mongoose.Schema({
    name:{
        type:String
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AgendaJob"
    },
    apiUrl: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    headers: {
        type: Object,
        required: true
    },
    body: {
        type: Object
    },
    apiResponse: {
        type: Object
    },
    apiError: {
        type: Object
    },
    status: {
        type: String
    },
    timezone: {
        type: String
    },
    immediate: {
        type: Date
    },
    recurringFrom: {
        type: Date
    },
    recurringTo: {
        type: Date
    },
    recurringTime: {
        type: String
    },
    recurringDays: {
        type: [String]
    },
    recurringDate: {
        type: Date
    },
    user:{
        type: String,
        required:true
    }
},{
      timestamps:true
})

const Schedule = mongoose.model("Schedule", scheduleSchema)

module.exports = Schedule