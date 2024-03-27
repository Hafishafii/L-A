// const mongoose=require('mongoose');
// const moment=require('moment-timezone');

// const adminSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     email:{
//         type:String,
//         required:true
//     },
//     phoneNumber:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     isAdmin:{
//         type:Number,
//         required:true
//     },
//     isActive:{
//         type:Boolean,
//         default:true
//     },
//     cart : [{
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'Product', 
//         },     
//         quantity: Number,  
//     }],
 
//     address: [addressSchema]
// })

// module.exports=mongoose.model('admin',userSchema);