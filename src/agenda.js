const Agenda = require('agenda')
// const env = process.env.NODE_ENV || "development"
// const config = require(__dirname + "/../config/config.js")[env]
// const { allDefinitions } = require("./definitions");

const dburi = `mongodb+srv://apivproject:${process.env.API_KEY}@cluster0.od1wh3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// establised a connection to our mongoDB database.
const agenda = new Agenda({
    db: { 
            address: dburi, 
            collection: 'agendajobs', 
            options: { useUnifiedTopology: true }, 
        },
        processEvery: "1 minute",
        maxConcurrency: 20,
    })

// listen for the ready or error event.
agenda
    .on('ready', async () => {
        console.log("Agenda started!")
        // (async () => {
            await agenda.start()
        // })()
    })
    .on('error', () => console.log("Agenda connection error!"))

// (async function () {
//     await agenda.start()
// })()

module.exports = agenda