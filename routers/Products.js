const express = require('express');
const Router = express.Router();
const addPro = require('./validators/productValid');
const { validationResult } = require('express-validator');
const Product = require('../models/ProductOJ');
const isLogin = require('../auth/isLogin');
const rateLimit = require('express-rate-limit');

const proListLimiter = rateLimit({
	windowMs: 10 * 1000,
	max: 5, 
	message:
		`Cannot send more than 5 requests in 10 seconds when you reading the product's list!`,
	standardHeaders: true, 
	legacyHeaders: false,
})

const proDetailLimiter = rateLimit({
	windowMs: 10 * 1000,
	max: 5, 
	message:
		`Cannot send more than 5 requests in 10 seconds when you reading the product's detail!`,
	standardHeaders: true, 
	legacyHeaders: false,
})

Router.get('/', proListLimiter, (req, res) => {
    Product.find().select('name price desc')
    .then(prolist => {
        res.json({
            message: "Welcome to my Product list",
            code: 0,
            data: prolist
        })
    })
});

Router.post('/', isLogin, addPro, (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        let {name, price, desc} = req.body;
        let product = new Product({
            name: name,
            price: price,
            desc: desc
        });

        product.save()
        .then(() =>{
            return res.json({code: 0, message: 'Add new product successful!', data: product});
        }).catch(e => {
            return res.json({code: 2, message: 'Failed to add new product!:  ' + e.message});
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

Router.get('/:id', proDetailLimiter, (req, res) => {
    let {id} = req.params;
    if(!id){
        return res.json({code: 1, message: "Product's id not found!"});
    }
    Product.findById(id)
    .then(pro => {
        if(pro){
            return res.json({code: 0, message: "This is the product you're looking for!", data: pro});
        }else{
            return res.json({code: 2, message: "Product not found!"});
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
        return res.json({code: 1, message: "Product's id not found!"});
    }

    Product.findByIdAndDelete(id)
    .then(pro => {
        if(pro){
            return res.json({code: 0, message: "Delete product successful"});
        }else{
            return res.json({code: 1, message: "Product not found!"});
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
        return res.json({code: 1, message: "Product's id not found!"});
    }

    let informations =  ['name', 'price', 'desc'];
    let update = req.body;

    for(infor in update){
        if(!informations.includes(infor)){
            delete update[infor];
        }
    }

    Product.findByIdAndUpdate(id, update, {
        new: true
    })
    .then(pro => {
        if(pro){
            return res.json({code: 0, message: "Update product successful", data: pro});
        }else{
            return res.json({code: 1, message: "Product not found!"});
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