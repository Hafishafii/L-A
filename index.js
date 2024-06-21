const express=require('express')
const logger=require('morgan')
const bcrypt=require('bcrypt')
const multer=require('multer')
const nocache=require('nocache')
const path=require('path')
const mongoose=require('mongoose')
const {get}=require('http')
const dotenv=require('dotenv')
dotenv.config({path:'.env'})
const session =require('express-session')
const flash = require('connect-flash');

const app=express()
app.set('views','./views/userSide')


// app.use(logger('dev'))

app.use(nocache())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine','ejs');

app.use('/assets',express.static(path.resolve(__dirname,"public/assets")))
app.use('/adminassets',express.static(path.resolve(__dirname,"public/admin-assets")))

app.use(session({
    secret:process.env.session_key,
    resave:false,saveUninitialized:false,
    cookie:{maxAge: 86400000,
}}))


// routes
const userRoute=require('./routes/userRoutes')
const adminRoute=require('./routes/adminRoutes')
app.use('/',userRoute)
app.use('/admin',adminRoute)


app.use('/error',(req, res) => {
    console.log("request object",req);

    res.render('errorPage');
});
app.use('*',(req, res) => {
    res.redirect('/error')
});
app.use(flash());


// server
app.listen(3000,()=> {
    console.log("Server is running in port http://localhost:3000");
})

 



// connect database 
mongoose.connect(process.env.MONGODB_URL).then(()=> {
    console.log('connected to mongoDB');
})  
