const mongoose = require('mongoose')

const url = "mongodb+srv://danish99:danish99@studentms.atuf0mq.mongodb.net/?retryWrites=true&w=majority";
const connectToMongo=()=>{
    mongoose.connect(url)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( () => {
        console.error(`Error connecting to the database.`);
    })
}
module.exports= connectToMongo;