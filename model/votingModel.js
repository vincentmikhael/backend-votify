const mongoose = require('mongoose')

const votingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        min: 1,
        max: 500,
    },
    pilihan: {
        type: Array,
        required: true
    },
    vote: [
        {
            name: String,
            pilihan: String,
            alasan: String,
            mac: String
        }
    ],
})

module.exports = mongoose.model('Voting', votingSchema)