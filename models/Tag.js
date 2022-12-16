import mongoose from "mongoose"

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

export default mongoose.model("Tag", tagSchema)