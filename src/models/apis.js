const mongoose = require("mongoose")

const apiSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    url: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    headers: {
        type: Object
    },
    body: {
        type: Object
    },
    user:{
        type: String,
        required:true
    }
},{
      timestamps:true
})

const Api = mongoose.model("Api", apiSchema)

module.exports = Api