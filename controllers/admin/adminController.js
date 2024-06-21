const bcrypt=require("bcrypt")
const User=require("../../model/userModel")
const moment = require("moment");



const loadLogin=async (req,res)=> {
    try {
        res.render("adminLogin");
    }
    catch(error) {
        console.log(error.message);
        res.status(500).res.redirect('/error')
        // res.status(500).send("Internal Server Error");
    }
}







const adminLogin=async (req,res)=> {
    try {
        console.log(req.body);
        const email=req.body.email;
        const password=req.body.password;
        console.log("here");

        const adminData=await User.findOne({email:email});
        if(adminData) {

            const passwordMatch=await bcrypt.compare(password,adminData.password);
            if(passwordMatch && adminData.isAdmin == 1) {
                req.session.admin = adminData._id;
                console.log("succes");

                res.redirect("/admin/dashboard");
                console.log(req.session);
            }
            else {
                res.render("adminLogin",{message:" password incorrect"});
            }
        }
        else {
            res.render("adminLogin",{message:"email incorrect"})
        }
    }
    catch(error) {
      res.redirect('/error')
    }
}








const logOut=async (req, res)=> {
    try {
      console.log('Haiii');
      req.session.destroy();
      res.redirect("/admin/login");
    } catch (error) {
      // console.log(error.message);
      res.redirect('/error')

    }
  };







  
  const loadDashboard=async (req, res)=> {
    try {
      res.render("adminDashboard");
    } catch (error) {
      // console.log(error.message);
      res.redirect('/error')

    }
  };
  





module.exports={
    loadLogin,
    adminLogin,
    logOut,
    loadDashboard
}