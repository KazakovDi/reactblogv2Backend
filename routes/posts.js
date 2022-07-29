import { Router } from "express";
import Post from "../models/Post.js";
import checkAuth from "../utils/checkAuth.js";
export const router = new Router()

router.get("/", async (req,res)=> {
    try {
        const posts = await Post.find().populate("user")
        res.json(posts)
    } catch(err) {
        console.log(err)
        res.status(404).json({message:"Нима статей, придётся всё-таки выйти на улицу и найти друзей"})
    }
})
router.post("/create",checkAuth, async (req,res)=> {
    try {
        const doc = new Post({
            title:req.body.title,
            text:req.body.text,
            tags:req.body.tags,
            imageUrl:req.body.imageUrl,
            user:req.userId,
        })
        const post = await doc.save()
        res.json(post)
    } catch(err) {
        console.log(err)
        res.status(400).json({message:"Не получилось создать статью"})
    }
})
router.get("/create", async(req,res)=> {})
router.get("/:id", async (req,res)=> {
    try {
        Post.findOneAndUpdate(
        {_id:req.params.id},
        {$inc: {viewsCount: 1}},
        {returnDocument:"after"},
        (err,doc)=> {
            if(err) {
                console.log(err)
                return res.status(500).json({message:"Не удалось загрузить статью"})
            }
            if(!doc)
                return res.status(404).json({message: "Статья не найдена"})
            
            res.json(doc)
        }).populate("user")
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Статьи нима"})
    }
})
router.patch("/:id", checkAuth, async (req,res)=> {
    try {
        await Post.updateOne(
        {_id:req.params.id},
        {
            title:req.body.title,
            text:req.body.text,
            tags:req.body.tags,
            imageUrl:req.body.imageUrl,
            user:req.userId,
        })
        res.json({success:true})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось обновить статью"})
    }
})
router.delete("/:id", checkAuth, async (req,res)=> {
    try {
        Post.findOneAndDelete({
            _id:req.params.id
        },
        (err, doc)=> {
            if(err) {
                console.log(err)
                return res.status(500).json({message:"Не удалось удалить статью"})
            }
            if(!doc)
                return res.status(404).json({message:"Статья не найдена"})
        })
        res.json({success:true})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось обновить статью"})
    }
})