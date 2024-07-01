const mongoose = require("mongoose")

const recurringScheduleSchema = new mongoose.Schema({
    from: {
        type:  Date,
        required: true
    },
    to: {
        type:  Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    days: {
        type: [String],
        validate: [
            // {
            //     validator: function(arr) {
            //         if (this.days) {
            //             const minItems = 1
            //             const maxItems = 7
            //             return arr.length >= minItems && arr.length <= maxItems
            //         }
            //     },
            //     message: props => `Array must contain between 1 and 7 items. Current length: ${props.value.length}`
            // },
        {
            validator: function() {
                return this.days || this.date
            },
            message: props => `Days or Date is required`
        }]
    },
    date: {
        type: Number,
        min: 1,
        max: 31,
        validate: {
            validator: function() {
                return this.date || this.days
            },
            message: props => `Days or Date is required`
        }
    }
})

const responseSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.UUID,
    response: Object,
    status: Number,
    ranAt: Date
})

const scheduleSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AgendaJob",
        default: null
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
        type: [responseSchema],
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'SCHEDULED', 'SCHEDULE_FAILED', 'RUN_FAILED', 'API_SUCCESS', 'API_FAILED']
    },
    timezone: {
        type: String
    },
    immediate: {
        type: Date,
        // min: new Date(),
        validate: {
            validator: function() {
                return this.recurring || this.immediate
            },
            message: props => `Scheduling details required!`
        }
    },
    recurring: {
        type: recurringScheduleSchema,
        validate: {
            validator: function() {
                return this.recurring || this.immediate
            },
            message: props => `Scheduling details required!`
        }
    },
    user:{
        type: String,
        required: true
    }
},{
      timestamps:true
})

const Schedule = mongoose.model("Schedule", scheduleSchema)

module.exports = Schedule