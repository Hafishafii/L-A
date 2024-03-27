const isLogin=async(req,res,next)=> {
    try {
        if(req.session.admin) {
            // console.log(req.session.admin_id);
            next();
        }
        else {
            res.redirect('/admin/login')
        }
    }
    catch(error) {
        console.log(error.message);
    }
}


const isLogout=async(req,res,next)=> {
    try {
        if(req.session.admin) {
            res.redirect('/admin/dashboard');
        }
        else {
            next();
        }
    }
    catch(error) {
        console.log(error.message);
    }
}



const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.render('errorPage')
};



module.exports={
    isLogin,
    isLogout,
    errorHandler
}