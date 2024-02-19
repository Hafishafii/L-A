const User=require('../model/userModel')

const isLogIn = async(req,res,next)=>{
    try {
        if(req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            console.log(req.session.user_id);

            if(user.isActive) {
            next();
            } 
            else {
            req.session.user_id = null;
            res.redirect('/login')
            }
        }
        else {
            res.redirect('/login');
        }   
    } catch (error) {
        console.log(error.message);
    }
}

const isLogOut = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }
        else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogIn,
    isLogOut
}