const mongoose = require("mongoose")

const uri = `mongodb+srv://apivproject:${process.env.API_KEY}@cluster0.od1wh3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
// mongodb+srv://apivproject:<password>@cluster0.od1wh3m.mongodb.net/

// Connecting to database;
mongoose.connect(uri, {
      useNewUrlParser:true,
      useUnifiedTopology:true,
      // useCreateIndex:true
})
.then(() => console.log("Successfully connect to MongoDB."))
.catch(err => console.error("MongoDB Connection error", err));

