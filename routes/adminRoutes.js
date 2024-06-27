const express=require("express");
const admin_route=express();
const session=require('express-session');
const config=require("../config/config");
const auth=require('../middleware/adminAuth');
const multer=require('multer');
const path=require('path');
const flash=require('express-flash');




// flash
admin_route.use(flash());



// paths
admin_route.set('views','./views/adminSide')




const adminController=require("../controllers/admin/adminController")
const userManagementController=require('../controllers/admin/userManagementController')
const categoryController=require('../controllers/admin/categoryController')
const productController=require('../controllers/admin/productController')
const {isLogin}=require("../middleware/userAuth")
const orderManagementController=require('../controllers/admin/orderManagementController')
const couponController=require('../controllers/admin/couponConrtoller')

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
admin_route.get('/soft-delete-product/:id', auth.isLogin, productController.softDeleteProduct);
admin_route.get('/delete-image/:id/:img',productController.deleteImage)


admin_route.get('/users',auth.isLogin,userManagementController.loadUsers)
admin_route.get('/edit-user/:id',auth.isLogin,userManagementController.loadEditUser)
admin_route.post('/edit-user/:id',userManagementController.editUser)
admin_route.get('/block-user',userManagementController.blockOrUnblockUser)


admin_route.post('/continue-order', orderManagementController.continueOrder)
admin_route.get('/orders',auth.errorHandler,orderManagementController.loadOrders)
admin_route.post('/cancelorder',orderManagementController.cancelOrder)
admin_route.post('/change-order-status', orderManagementController.changeStatus)


admin_route.get("/couponManagementPage",couponController.couponManagementPage);
admin_route.post("/addCoupon", couponController.addCoupon);
admin_route.post("/softDeleteCoupon", couponController.softDeleteCoupon);
admin_route.post("/updateCoupon", couponController.updateCoupon);


module.exports = admin_route;