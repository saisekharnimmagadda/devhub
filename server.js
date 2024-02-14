const express= require('express');
const mongoose = require('mongoose');
const devuser=require('./devuser');
const jwt=require('jsonwebtoken');
const middleware = require('./middleware');
const reviewmodel= require('./reviewmodel');
const cors=require('cors');
const app= express();
app.use(express.json());
app.use(cors({origin:'*'}));
mongoose.connect('mongodb+srv://saisekhar:SaiSekhar@cluster0.z7muzie.mongodb.net/?retryWrites=true&w=majority').then(
    ()=>console.log('Db is connected')
);
app.get('/',(req,res)=>{
    res.write('HelloWorld...!');
    res.end();
});
app.post('/register', async (req, res)=>{
    try{
        const {fullname,email,mobile,skill,password,confirmpassword}= req.body;
        const exist= await devuser.findOne({email});
        if(exist){
            res.status(400).send('user already existed');
        }
        if(password!=confirmpassword){
            res.status(403).send('Password Mismatch');
        }
        let newUser= new devuser({
            fullname,email,mobile,skill,password,confirmpassword
        });
        newUser.save();
        res.status(200).send('user Registered succesfully');

    }
    catch(err){
        console.log(err);
        res.status(500).send('Server error');
    }
});
app.post('/login',async (req,res)=>{
    try{
        const {email,password}= req.body;
        const exist=  await devuser.findOne({email});
        if(!exist){
            res.status(400).send('user not existed');
        }
        if(exist.password != password){
            res.status(400).send('Password incorrect');
        }
        let payload= {
            user:{
                id:exist.id
            }
        };
        jwt.sign(payload,'jwtpassword',{expiresIn : 360000000},
        (err,token)=>{
            if(err) throw err;
            res.json({token});
        });
    }
    catch(err){
        console.log(err);
        res.status(500).send('Server errorCant login');
    }
});
app.get('/allprofiles',middleware, async (req,res)=>{
    try{
        const allporfiles = await devuser.find();
        res.json(allporfiles);

    }
    catch(err){
        console.log(err);
        res.status(400).send('server error in getting profiles');
    }
});
app.get('/myprofile',middleware, async(req,res)=>{
    try{
         let user = await devuser.findById(req.user.id);
         res.json(user);
    }
    catch(err){
        consloe.log(err);
        res.status(500).send('Server error in my profile');
    }
});
app.post('/addrating',middleware,async(req, res)=>{
    try{
        const{taskworker, rating} =req.body;
        const exist= await devuser.findById(req.user.id);
        const newReview=new reviewmodel({
            taskprovider:exist.fullname,
            taskworker,rating
        });
        await newReview.save();
        res.status(200).send('ratingupdatedsuccesfully');
    }
    catch(err){
        consloe.log(err);
        res.status(500).send('Server error in adding review');
    }
});
app.get('/myreview',middleware, async(req, res)=>{
    try{
        let allreviews=await reviewmodel.find();
        let myreviews= allreviews.filter(review =>review.taskworker.toString()=== req.user.id.toString());   // USER IS AN OBJECT IN NIDDLEWARE WITH ID
        res.status(200).json(myreviews);
    }
    catch(err){
        consloe.log(err);
        res.status(500).send('Server error in my review');
    }
});

app.listen(8080,()=> console.log('Server is running'));