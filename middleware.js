const jwt = require ('jsonwebtoken');
module.exports= function(req,res, next){
    try{
        let token= req.header('x-token');
        if(!token){
            res.status(400).send('Token not found');
        }
        let decoded= jwt.verify(token,'jwtpassword');
        req.user= decoded.user;
        next();
    }
    catch(err){
        console.log(err);
        res.status(400).send('Token Error in logging');
    }
 };