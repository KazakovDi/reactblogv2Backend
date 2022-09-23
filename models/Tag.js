const mongoose = require("mongoose") 

const tagSchema = new mongoose.Schema({
    body: {
        type:String,
        required:true
    },
    count: {
        type:Number,
        required:true,
        default:1
    }
})

module.exports = mongoose.model("Tag", tagSchema)