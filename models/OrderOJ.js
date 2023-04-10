const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    total: Number,
    products: String
})

module.exports = mongoose.model('Order', OrderSchema);