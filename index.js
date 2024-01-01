const connectToMongo = require('./db');
const express = require('express')
connectToMongo();
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000"
};

const app = express()
const port = 5000

app.use(cors(corsOptions));
app.use(express.json());
//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
module.exports= app;



