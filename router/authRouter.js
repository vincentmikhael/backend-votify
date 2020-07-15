const express = require('express')
const router = express.Router()
const User = require('../model/userModel')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const isAuth = require('../verifyToken')

router.get('/', isAuth, async (req,res)=>{

    try{
        const user = await User.find({})
        if(user){
            res.json(user)
        }
    }catch(er){
        res.json({succes: false, msg: 'Ups, user yang anda cari tidak ada'})

    }
})

router.get('/profile', isAuth, async (req,res)=>{

    try{
        const user = await User.findById(req.user)
        if(user){
            res.json(user)
        }
    }catch(err){
        res.json(err)
    }
})

router.post('/register', async (req,res)=>{

    const Schema = Joi.object({
        name: Joi.string().trim().min(3).max(30).required(),
        email: Joi. string().trim().email().max(100).required(),
        password: Joi.string().trim().min(3).required()

    })

    const validating = Schema.validate(req.body, {abortEarly: false})
    if(validating.error){
        const errorMessage = validating.error.details.map(e=>{
            return [
                e.message
            ]
        })
        return res.json({success: false, msg: errorMessage})
    }

    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist) return res.json({success: false, msg: ['Email already exists']})
    
    let passwordCrypt = await bcrypt.hash(req.body.password,10)

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: passwordCrypt 
    })

    try{
        await newUser.save()
        res.json({success: true, msg: 'User successfully created'})
    }catch(err){
        res.json({success: false, err})
    }
})

router.post('/login', async (req,res)=>{


    const Schema = Joi.object({
        email: Joi. string().trim().email().max(100).required(),
        password: Joi.string().trim().min(3).required()
    })

    const validating = Schema.validate(req.body, {abortEarly: false})
    if(validating.error){
        const errorMessage = validating.error.details.map(e=>{
            return [
                e.message
            ]
        })
        return res.json({success: false, msg: errorMessage})
    }
    
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.json({success: false, msg: ['Email not found!']})
    }

    const passwordUser = await bcrypt.compare(req.body.password, user.password)
    if(passwordUser){
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY)

        res.header('auth-token', token).json({
            success: true,
            user,
            token
        })
    }else{
        res.json({success: false, msg: ['wrong password']})
    }
    
})


module.exports = router