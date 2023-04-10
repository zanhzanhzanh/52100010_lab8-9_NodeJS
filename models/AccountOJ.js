const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    fullname: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})

module.exports = mongoose.model('Account', AccountSchema);