require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = async function(req,res,next){
    const token =  req.header('auth-token')
    if(!token) return res.json({success: false, msg: 'Access Denied! Kamu harus login terlebih dahulu.'})
    
    try{
        const verified = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        if(!verified) return res.status(400).status({success: false, msg: 'Invalid token'})
        req.user = verified.id
        next()
    }catch(er){
        res.status({success: false, msg: 'Invalid token'})
    }
    
}