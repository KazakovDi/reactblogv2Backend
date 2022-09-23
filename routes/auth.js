const Post = require("../models/Post")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {Router} = require("express")
const router = new Router()
const { validationResult } = require("express-validator") 
const {loginValidation, registerValidation} = require("../validation/authValidation")
const checkAuth = require("../utils/checkAuth")
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
            newUser.avatarUrl = "http://localhost:5000/uploads/empty_user.png"
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
        user.avatarUrl = `http://localhost:5000` + req.body.avatarUrl
        await user.save()
        res.json("success")

})
router.get("/:id", async (req,res)=> {
    try {
        const user = await User.findById(req.params.id)
        if(!user)
            res.status(404).json({message:"Такого пользователя нет"})
        const {password, ...userData} = user._doc
        res.json({userData})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Не удалось найти пользователя"})
    }
})
module.exports = router