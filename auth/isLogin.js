const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let auth = req.header('Authorization');
    if(!auth){
        return res.status(401).json({code: 101, message: "Please provide jwt tokens from header"});
    }
    
    let token = auth.split(' ')[1];
    if(!token){
        return res.status(401).json({code: 101, message: "Please provide the valid jwt tokens"});
    }

    const {JWT_SECRET} = process.env;
    

    jwt.verify(token, JWT_SECRET, (err, data) => {
        if(err){
            return res.status(401).json({code: 101, message: "Token is invalid or expired"});
        }
        req.user = data;
        next();
    })
}