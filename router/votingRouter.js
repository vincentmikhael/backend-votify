const express = require('express')
const router = express.Router()
const Voting = require('../model/votingModel')
const Joi = require('@hapi/joi')
const isAuth = require('../verifyToken')
const address = require('address')

router.get('/:id', isAuth ,async (req,res)=>{
    try{
        const get = await Voting.find({userId: req.params.id}).sort({date: 'asc'})
    if(get){
        res.json(get)
    }
    }catch(err){
        res.json({success:false, msg: 'Oops.. data tidak ditemukan'})
    }
})

router.get('/vote/:id', isAuth, async(req,res)=>{
    try{
        const dataVote = await Voting.findOne({_id: req.params.id})
        if(dataVote){
            res.json({success: true, dataVote})
        }else{
            res.json({success:false, msg: 'Oops.. data tidak ditemukan'})
        }
    }catch(err){
        res.json({success:false, msg: 'Oops.. data tidak ditemukan'})
    }
})



router.post('/add', isAuth, async (req,res)=>{

    const Schema = Joi.object({
        userId: Joi.string(),
        title: Joi.string().trim().min(3).max(200).required(),
        pilihan: Joi.array().items(Joi.string().required()),
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

    const addVoting = new Voting({
        userId: req.body.userId,
        title: req.body.title,
        pilihan: req.body.pilihan
    })

    try{
        const votes = await addVoting.save()
        res.json({success: true, msg: 'Voting telah ditambahkan', votes})
    }catch(err){
        res.json(err)
    }
})

router.get('/check/:votingId', async (req,res)=>{
    const macUser = await address.mac(function (err, addr) {
        return addr
      })
      const user = await Voting.findById(req.params.votingId)
      const duplicateMac = user.vote.filter(e =>{
        return e.mac === macUser
      })
      if(duplicateMac.length){
          return res.json({success: true, msg: 'Ups.. sepertinya kamu sudah melakukan voting'})
      }else{
          return res.json({success: false})
      }
})

router.post('/vote/:votingId', async (req,res)=>{

    const macUser = await address.mac(function (err, addr) {
        return addr
      })
      const user = await Voting.findById(req.params.votingId)
      const duplicateMac = user.vote.filter(e =>{
        return e.mac === macUser
      })
      if(duplicateMac.length){
          return res.json({success: false, msg: 'Ups.. sepertinya kamu sudah melakukan voting'})
      }
      
    const userChoice = {
        name: req.body.name,
        pilihan: req.body.pilihan,
        alasan: req.body.alasan,
        mac: macUser
    }
        Voting.findByIdAndUpdate(req.params.votingId, {
            $push: {vote : userChoice}
        },(err,suc)=>{
            if(err){
                return res.json(err)
            }
            res.json({success: true, msg: 'Terima kasih telah melakukan voting'})
        })
})

router.delete('/vote/:id', isAuth, async (req,res)=>{
    try{
        const deletedVote = await Voting.deleteOne({_id: req.params.id})
        if(deletedVote.ok === 1){
            res.json({success: true, msg: 'Data successfully deleted!'})
        }
    }catch(err){
        console.log(err)
    }
    
    
})

module.exports = router