const express = require('express');
const Router = express.Router();
const addOrder = require('./validators/orderValid');
const { validationResult } = require('express-validator');
const Order = require('../models/OrderOJ');
const isLogin = require('../auth/isLogin');
const rateLimit = require('express-rate-limit');


const orListLimiter = rateLimit({
	windowMs: 10 * 1000,
	max: 5, 
	message:
		`Cannot send more than 5 requests in 10 seconds when you reading the order's list!`,
	standardHeaders: true, 
	legacyHeaders: false,
})

const orDetailLimiter = rateLimit({
	windowMs: 10 * 1000,
	max: 5, 
	message:
		`Cannot send more than 5 requests in 10 seconds when you reading the order's detail!`,
	standardHeaders: true, 
	legacyHeaders: false,
})

Router.get('/', orListLimiter, (req, res) => {
    Order.find().select('total products')
    .then(orlist => {
        res.json({
            message: "Welcome to my Order list",
            code: 0,
            data: orlist
        })
    })
});

Router.post('/', isLogin, addOrder, (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        let {total, products} = req.body;
        let order = new Order({
            total: total,
            products: products
        });

        order.save()
        .then(() =>{
            return res.json({code: 0, message: 'Add new order successful!', data: order});
        }).catch(e => {
            return res.json({code: 2, message: 'Failed to add new order!:  ' + e.message});
        })

    }else{
        let messages = result.mapped();
        let noti = '';
    
        for (mess in messages){
            noti = messages[mess];
            break;
        }
    
        return res.json({code: 1, messages: noti});
    }
    
});

Router.get('/:id', orDetailLimiter, (req, res) => {
    let {id} = req.params;
    if(!id){
        return res.json({code: 1, message: "Order's id not found!"});
    }
    Order.findById(id)
    .then(order => {
        if(order){
            return res.json({code: 0, message: "This is the order you're looking for!", data: order});
        }else{
            return res.json({code: 2, message: "Order not found!"});
        }
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')){
            return res.json({code: 3, message: "Id is invalid!"});
        }
        return res.json({code: 3, message: e.message});
    })
})

Router.delete('/:id', isLogin, (req, res) => {
    let {id} = req.params;
    if(!id){
        return res.json({code: 1, message: "Order's id not found!"});
    }

    Order.findByIdAndDelete(id)
    .then(order => {
        if(order){
            return res.json({code: 0, message: "Delete order successful"});
        }else{
            return res.json({code: 1, message: "Order not found!"});
        }
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')){
            return res.json({code: 3, message: "Id is invalid!"});
        }
        return res.json({code: 3, message: e.message});
    })
});

Router.put('/:id', isLogin, (req, res) => {
    let {id} = req.params;
    if(!id){
        return res.json({code: 1, message: "Order's id not found!"});
    }

    let informations =  ['total', 'products'];
    let update = req.body;

    for(infor in update){
        if(!informations.includes(infor)){
            delete update[infor];
        }
    }

    Order.findByIdAndUpdate(id, update, {
        new: true
    })
    .then(order => {
        if(order){
            return res.json({code: 0, message: "Update order successful", data: order});
        }else{
            return res.json({code: 1, message: "Order not found!"});
        }
    })
    .catch(e => {
        if(e.message.includes('Cast to ObjectId failed')){
            return res.json({code: 3, message: "Id is invalid!"});
        }
        return res.json({code: 3, message: e.message});
    })
})

module.exports = Router;