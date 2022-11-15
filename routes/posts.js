import Post from"../models/Post.js"
import User from"../models/User.js"
import Tag from"../models/Tag.js"
import Comment from "../models/Comment.js"
import {Router} from "express"
const router = new Router()
import checkAuth from "../utils/checkAuth.js"
import multer from "multer"
const storage = multer.diskStorage({
    destination: (req, file, callback)=> {
        callback(null, "uploads")
    },
    filename: (req, file, callback)=> {
        req.imagePath = Math.random()
        callback(null, req.imagePath + file.originalname)
    }
})

const upload = multer({storage})

router.get("/tags", async (req, res)=> {
    try {
        const sortProps = ["count", - 1]
        const tags = await Tag.find().sort([sortProps]).limit(5).exec()
        // const tags = undefined
        if(!tags)
            return res.status(404).json({message: "Теги не найдены"})
        else
            res.json(tags)
    } catch(err) {
        res.status(500).json({message:"Теги сейчас не доступны"})
        console.log(err)
    }
})
router.get("/posts", async (req, res)=> {
    try {
        let sortProps = ['createdAt', - 1]
        if(req.query.sortProps !== undefined)
            sortProps = [req.query.sortProps, - 1]
        let searchProps = {}
        // req.query = undefined
        if (req.query.searchProps !== "undefined" && req.query.searchProps !== undefined && req.query.searchProps !== '')
            searchProps = {'tags':{ $elemMatch: {'body': req.query.searchProps}}}
        const posts = await Post.find(searchProps).sort([sortProps]).populate("user").exec()
        console.log("posts", posts)
        res.json(posts)
    } catch(err) {
        res.status(500).json({message:"На данный момент сайт не работает, попробуйте зайти позже"})
        console.log(err)
    }
})
router.post("/uploadImage",checkAuth, upload.single("image"), async(req,res)=> {
    try {
        res.json({
            url: `/uploads/${req.imagePath + req.file.originalname}`
        })
    } catch(err) {
        console.log(err)
    }
    
})
router.get("/posts/:id", async (req, res)=> {
    try {
        Post.findOneAndUpdate(
            {_id:req.params.id},
            {$inc: {viewsCount: 1}},
            {returnDocument:"after"},
            (err,doc)=> {
                if(err) {
                    return res.status(500).json({message:"Не удалось загрузить статью"})
                }
                if(!doc)
                    return res.status(404).json({message: "Статья не найдена"})       
                res.json([doc])
            }).populate("user")
    } catch(err) {
        res.status(500).json({message:"Серверная ошибка. Попробуйте обновить страницу или зайти позже"})
        console.log(err)
    }
})
router.post("/createPost", checkAuth, async (req,res)=> {
    try {
        const tags = []
        for (let i = 0; i < req.body.tags.length; i++) { 
                const tag = await Tag.findOneAndUpdate(
                {body:req.body.tags[i]},
                {$inc: {count: 1}},
                {returnDocument:"after"})
                if(tag === null) {
                    const newTag = new Tag({body: req.body.tags[i]})
                    await newTag.save()
                    tags.push(newTag)
                } else {
                    tags.push(tag)
                }
        }
        const newPost = await new Post({
            title: req.body.title,
            tags: tags,
            text: req.body.text,
            user: req.userId
        })
        if(req.body.imageUrl)
            newPost.imageUrl =  req.body.imageUrl
        await newPost.save()
        res.json(newPost)
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Ошибка создания поста"})
    }
})
router.post("/createComment/:id", checkAuth, async (req,res)=> {
    try {
        const newCom = await new Comment({
            text: req.body.text,
            user: req.userId
        })
        const post = await Post.findById(req.params.id)
        post.comments.push(newCom)
        await newCom.save()
        await post.save()
        res.json(newCom)
    } catch(err) {
        console.log(err)
        res.status(500).json({message: "Ошибка создания поста"})
    }
})
router.patch("/posts/:id/edit",checkAuth, async (req,res)=> {
    try {
        const tags = []
        for (let i = 0; i < req.body.tags.length; i++) { 
                const tag = await Tag.findOne({body:req.body.tags[i]})
                if(tag === null) {
                    const newTag = new Tag({body: req.body.tags[i]})
                    newTag.save()
                    tags.push(newTag)
                } else {
                    tags.push(tag)
                }
        }
        const post = await Post.updateOne(
            {_id:req.params.id},
            {
                title:req.body.title,
                text:req.body.text,
                tags,
                imageUrl:req.body.imageUrl,
                user:req.userId,
            })
            res.json(post)
    }
    catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось обновить статью"})
    }
        
})
router.delete("/posts/:id", checkAuth, async (req,res)=> {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        for (let i = 0; i < post.tags.length; i++) {
            const tag = await Tag.findOneAndUpdate(
                {body: post.tags[i].body},
                {$inc: {count: -1}},
                {returnDocument:"after"})
            if(tag.count === 0)
                await tag.remove()
        }
        for (let i = 0; i < post.comments.length; i++) {
            Comment.findOneAndDelete({text: post.comments[i].text})
        }
            const sortProps = [req.query.sortProps, - 1]
            let searchProps = {}
            if (req.query.searchProps !== "undefined")
                searchProps = {'tags':{ $elemMatch: {'body': req.query.searchProps}}}
            const posts = await Post.find(searchProps).sort([sortProps]).populate("user").exec()
            res.json(posts)
        } catch(err) {
            res.status(500).json({message:"Серверная ошибка"})
            console.log(err)
        }
})
export {router as postsRouter};