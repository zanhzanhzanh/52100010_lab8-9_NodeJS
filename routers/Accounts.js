const express = require('express');
const Router = express.Router();
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const registerValid = require('./validators/registerValid');
const loginValid = require('./validators/loginValid');
const Account = require('../models/AccountOJ');
const jwt = require('jsonwebtoken');

Router.get('/', (req, res) => {
    res.json({
        code: 0,
        message: "This is account's router"
    });
});

Router.get('/login', (req, res) => {
    res.json({
        code: 0,
        message: "Login form"
    });
});

Router.get('/register', (req, res) => {
    res.json({
        code: 0,
        message: "Register form"
    });
});

Router.post('/login', loginValid, (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        let {email, password} = req.body;
        let customer = undefined;
        Account.findOne({email: email})
        .then(user => {
            if(user){
                customer = user;
                return bcrypt.compare(password, user.password);
            }else{
                throw new Error('This account is not existed!');
            }
        }).then(passMatch => {
            if(!passMatch){
                throw new Error('The password is not correct!');
            }else{
                const {JWT_SECRET} = process.env;
                jwt.sign({
                    email: customer.email,
                    fullname: customer.fullname,
                    password: customer.password
                }, JWT_SECRET, {
                    expiresIn: '1h'
                }, (err, token) => {
                    if(err) throw err;
                    return res.json({
                        code: 0,
                        message: 'Login successfull!',
                        token: token
                    })
                });
            }
        })
        .catch(e => {return res.status(401).json({code: 2, message: 'Login failed!:  ' + e.message});})
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

Router.post('/register', registerValid, (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        let {fullname, email, password} = req.body;
        Account.findOne({email: email})
        .then(user =>{
            if(user){
                throw new Error('This account is already existed!');
            }
        })
        .then(() => {
            return bcrypt.hash(password, 10);
        })
        .then(hashed =>{
            let customer = new Account({
                fullname: fullname,
                email: email,
                password: hashed 
            });
            return customer.save() 
        }).then(() => {
            return res.json({code: 0, message: 'Register successful!'});
        }).catch(e => {
            return res.json({code: 2, message: 'Register failed!:  ' + e.message});
        });
        
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


module.exports = Router;