const User=require ('../../model/userModel');
const { ObjectId } = require('mongodb');
const {logout}=require ('./adminController')





//  load users page
const loadUsers=async (req,res)=> {
    try {
        const users=await User.find();
        console.log(users);
        if(users){
            res.render('users',{users:users})
        }

    }
    catch(error) {
        console.log(error.message);
    }
}





// load edit user
const loadEditUser=async (req,res)=> {
    const id=req.params.id;
    User.findById(id).then((data) => {
        console.log(id);
        console.log(data);
        res.render('editUser',{data:data})
    }).catch((error) => {
        console.log(error.message);
    });
}







// edit user
const editUser=async (req,res)=> {
    try {
        console.log(req.body);
        const id=req.params.id;
        const data= {
            name:req.body.name,
            email:req.body.email,
            phoneNumber:req.body.phoneNumber,
            isActive:req.body.isActive
        }
        console.log(data);
        await User.findByIdAndUpdate(id,data)

        res.redirect('/admin/users')
    }
    catch(error) {
        console.log(error.message);
    }
}







// block or unblock
const blockOrUnblockUser = async (req, res) => {
    try {
        const id =new ObjectId(req.query.id) ;
        const block = {
            isActive: false
        };
        const unBlock = {
            isActive: true
        };
        const user = await User.findById(id);
        console.log(user);
        const updateData = user.isActive ? block : unBlock;
        await User.findByIdAndUpdate(id, updateData);
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error.message);
    }
};








module.exports={
    loadUsers,
    loadEditUser,
    editUser,
    blockOrUnblockUser
}