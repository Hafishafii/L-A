const mongoose=require('mongoose');
const moment=require('moment-timezone');


const addressSchema=new mongoose.Schema({
    name:{
        type:String
    },
    addressLine1:{
        type:String
    },
    addressLine2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    pinCode:{
        type:String
    },
    phone:{
        type:String
    },
    email:{
        type:String
    },
    addressType:{
        type:String
    }
})




const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
})





module.exports=mongoose.model('User',userSchema);