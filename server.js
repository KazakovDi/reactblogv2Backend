import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import {postsRouter} from "./routes/posts.js"
import {authRouter} from"./routes/auth.js"

const app = express()




app.use(cors())
app.use(express.json())


app.use("/", postsRouter)
app.use("/auth", authRouter)
app.use("/uploads", express.static("uploads"))

const start = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://user:user@cluster0.gjm6c.mongodb.net/blog?retryWrites=true&w=majority")
        app.listen(process.env.PORT || 5000, ()=> {
            console.log("Сервер начал работу")
        })
    } catch(err) {
        console.log(err)
    }
}
start()