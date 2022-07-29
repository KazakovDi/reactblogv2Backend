import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import {router as authRouter} from "./routes/auth.js"
import {router as postsRouter} from "./routes/posts.js"
import Post from "./models/Post.js";
import checkAuth from "./utils/checkAuth.js"
import cors from "cors"
const app = express()
app.use(express.json())
app.use(cors())

const storage = multer.diskStorage({
    destination: (_, __, callback)=> {
        callback(null, "uploads")
    },
    filename: (_, file, callback)=> {
        callback(null, file.originalname)
    }
})

const upload = multer({storage})
app.post("/uploads",checkAuth, upload.single("image"), async(req,res)=> {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.use("/auth", authRouter)
app.use("/posts", postsRouter)
app.use("/uploads", express.static("uploads"))
// app.use("/uploads", uploadRouter)

app.get("/tags", async (req,res)=> {
    try {
        const posts = await Post.find().limit(5).exec()
        const tags = posts.map(post=> post.tags).flat().slice(0,5)
        res.json(tags)
    } catch(err) {
        console.log(err)
        res.status(404).json({message:"Нима статей, придётся всё-таки выйти на улицу и найти друзей"})
    }
})

const start = async ()=> {
   // mongodb+srv://user:user@cluster0.gjm6c.mongodb.net/blog?retryWrites=true&w=majority
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        app.listen(process.env.PORT || 5000, ()=> {
            console.log("Пашет")
        })
    } catch(err) {
        console.error(err)
    }
}
start()