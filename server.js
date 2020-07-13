const express = require('express')
const app = express()
const authRouter = require('./router/authRouter')
const votingRouter = require('./router/votingRouter')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')

mongoose.connect(process.env.MONGOOSE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log('successfully connected to db')
}).catch((err)=>{
    console.log('failed to connect db')
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.use('/auth', authRouter)
app.use('/voting', votingRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT)