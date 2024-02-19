const express=require("express");
const admin_route=express();
const session=require('express-session');
const config=require("../config/config");
const auth=require('../middleware/adminAuth');
const multer=require('multer');
const path=require('path');
const flash=require('express-flash');



admin_route.use(express.json());
admin_route.use(express.urlencoded({extended: true}));



// flash
admin_route.use(flash());




//session

admin_route.use(session({
    secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: false, 
  }));







// paths

admin_route.set('view engine','ejs');
admin_route.set('views','./views/adminSide')


const bodyParser=require('body-parser');
admin_route.use(bodyParser.json());   
admin_route.use(bodyParser.urlencoded({extended:true}));

const adminController=require("../controllers/admin/adminController")
const userManagementController=require('../controllers/admin/userManagementController')
const categoryController=require('../controllers/admin/categoryController')
const productController=require('../controllers/admin/productController')
const {isLogin}=require("../middleware/userAuth")


// multer category
const categoryStorage=multer.diskStorage({
  destination:(req,file,cb)=> {
    cb(null,path.join(__dirname,'../public/admin-assets/imgs/category'))
  },
  filename:(req,file,cb)=> {
    cb(null,Date.now() +'-'+file.originalname)
  } 
})
const categoryUpload=multer({storage:categoryStorage})




  //multer-product
  const productStorage = multer.diskStorage({
    destination :(req,file,cb) => {
      cb(null,path.join(__dirname, '../public/admin-assets/imgs/products'))
    },
    filename : (req, file, cb) => {
      cb(null, Date.now() +'-'+ file.originalname)
    }
  })
  const productUpload=multer({storage : productStorage})






// routes
admin_route.get('/', (req,res)=>{res.redirect('/admin/login')})
admin_route.get('/login',auth.isLogout,adminController.loadLogin)
admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)
admin_route.get('/logout',auth.isLogin,adminController.logOut)
admin_route.post('/login', adminController.adminLogin)


admin_route.get('/categories',auth.isLogin,categoryController.loadCategories)
admin_route.post('/categories',categoryUpload.single('image'),categoryController.addCategory)
admin_route.get('/categories-add',auth.isLogin,categoryController.loadAddCategory)
admin_route.get('/categories-edit/:id',auth.isLogin,categoryController.loadEditCategory)
admin_route.post('/categories-edit/:id',categoryUpload.single('image'),categoryController.updateCategory)
admin_route.get('/categories-delete/:id',auth.isLogin,categoryController.deletecategory)


admin_route.get('/add-product',auth.isLogin,productController.loadAddProduct)
admin_route.post('/add-product',productUpload.array('image'),productController.addProduct)
admin_route.get('/products',auth.isLogin,productController.loadProducts)
admin_route.get('/edit-product/:id',auth.isLogin,productController.loadEditProduct)
admin_route.post('/edit-product/:id',productUpload.array('image'),productController.editProduct)
admin_route.get('/delete-product/:id',auth.isLogin,productController.deleteProduct)
admin_route.get('/delete-image/:id/:img',productController.deleteImage)


admin_route.get('/users',auth.isLogin,userManagementController.loadUsers)
admin_route.get('/edit-user/:id',auth.isLogin,userManagementController.loadEditUser)
admin_route.post('/edit-user/:id',userManagementController.editUser)
admin_route.get('/block-user',userManagementController.blockOrUnblockUser)




module.exports = admin_route;