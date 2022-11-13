import Post from"../models/Post.js"
import User from"../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import {Router} from "express"
const router = new Router()
import { validationResult } from "express-validator"
import {loginValidation, registerValidation} from "../validation/authValidation.js"
import checkAuth from"../utils/checkAuth.js"
router.post("/login",loginValidation, async (req, res)=> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.status(400).json(errors.array())
        const user = await User.findOne({email: req.body.email})
        if(!user)
            return res.status(400).json({message:"Неверный E-mail или пароль"})
        const isValidPass = await bcrypt.compare(req.body.password, user.password)
        if(!isValidPass)
            return res.status(400).json({message:"Неверный E-mail или пароль"})
        const token = jwt.sign({
                _id:user._id
            },
            "secret",
            {expiresIn:"30d"})
        const {password, ...userData} = user._doc
        res.json({...userData, token})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Ошибка аутентификации"})
    }
})
router.post("/register",registerValidation, async (req, res)=> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.status(400).json(errors.array())
        const user = await User.findOne({email: req.body.email})
        if(user)
            return res.status(400).json({message:"E-mail занят"})
        const pass = req.body.password
        const salt = await bcrypt.genSalt(8)
        const hashedPassword = await bcrypt.hash(pass, salt)
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword,
            fullName: req.body.fullName
        })
        if(!req.body.avatarUrl)
            newUser.avatarUrl = `https://${process.env.REACT_APP_API_URL}/uploads/empty_user.png`
        else {
            newUser.avatarUrl = req.body.avatarUrl
        }
        await newUser.save()
        const token = jwt.sign({
            _id:newUser._id
        },
        "secret",
        {expiresIn:"30d"})
        const {password, ...userData} = newUser._doc
        res.json({...userData, token})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Ошибка регистрации"})
    }
})
router.get("/me", checkAuth, async (req,res)=> {
    try {
        const user = await User.findById(req.userId)
        if(!user)
            res.status(404).json({message:"Такого пользователя нет"})
        const {password, ...userData} = user._doc
        res.json({...userData})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось найти пользователя"})
    }
})
router.post("/changeAvatar",checkAuth, async (req,res)=> {
        const user = await User.findById(req.userId)
        user.avatarUrl = `https://reactblogv2.herokuapp.com` + req.body.avatarUrl
        await user.save()
        res.json("success")

})
router.get("/:id", async (req,res)=> {
    try {
        const user = await User.findById(req.params.id)
        if(!user)
            res.status(404).json({message:"Такого пользователя нет"})
        const {password, ...userData} = user._doc
        res.json({...userData})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось найти пользователя"})
    }
})
export {router as authRouter};
