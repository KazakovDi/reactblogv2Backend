import { Router } from "express";
import { validationResult } from "express-validator";
import { registerValidation, loginValidation } from "../validations/auth.js";
import checkAuth from "../utils/checkAuth.js";
import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


export const router = new Router


router.post("/register", registerValidation, async (req,res)=> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.status(400).json(errors.array())
        const pass = req.body.password
        const salt = await bcrypt.genSalt(8)
        const hashedPassword = await bcrypt.hash(pass, salt)

        const doc = new User({
            email: req.body.email,
            password:hashedPassword,
            fullName:req.body.fullName,
            avatarUrl: req.body.avatarUrl,
        })
        
        const user = await doc.save()
        const token = jwt.sign({
            _id:user._id
        },
        "secret",
        {expiresIn:"30d"})

        const {password, ...userData} = user._doc
        res.json({...userData, token})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Низя щас зарегаться"})
    }
    
})

router.post("/login", loginValidation, async (req,res)=> {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            console.log(errors.array())
            return res.json(errors.array())
        }
            
        const user = await User.findOne({email: req.body.email})
    if(!user)
        return res.status(404).json({message: "Такой челик не зареган", status:404})
    
    const isValidPass = await bcrypt.compare(req.body.password, user.password)
    if(!isValidPass)
        return res.status(400).json({message:"Правильно напиши, долбоёб", status:400})
        const token = jwt.sign({
            _id:user._id
        },
        "secret",
        {expiresIn:"30d"})
    const {password, ...userData} = user._doc
    res.json({...userData, token})
    } catch(err) {
        console.log("err", err)
        res.status(500).json({message:"Авторизоваться нимагу"})
    }
    
    
})

router.get("/me", checkAuth, async (req,res)=> {
    try {
        const user = await User.findById(req.userId)
        if(!user)
            res.status(404).json({message:"Нима такого пользователя"})
            const {password, ...userData} = user._doc
            res.json({userData})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Авторизоваться нимагу"})
    }
    
})