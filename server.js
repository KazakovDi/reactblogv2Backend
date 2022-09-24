const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const postsRouter = require("./Routes/Posts")
const authRouter = require("./Routes/Auth")

const app = express()




app.use(cors())
app.use(express.json())


app.use("/", postsRouter)
app.use("/auth", authRouter)
app.use("/uploads", express.static("uploads"))

const start = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        app.listen(process.env.PORT || 5000, ()=> {
            console.log("Сервер начал работу")
        })
    } catch(err) {
        console.log(err)
    }
}
start()