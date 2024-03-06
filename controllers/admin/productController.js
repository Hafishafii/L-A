const Product=require('../../model/productModel')
const Category=require('../../model/categoryModel')
const fs = require('fs');
const path = require('path');


// load add product
const loadAddProduct=async(req,res)=> {
    try {
        const category=await Category.find();
        res.render('addProduct',{category:category})
    }
    catch(error) {
        console.log(error.message);
    }
}





// load products
const loadProducts=async (req,res)=> {
    try {
        const products=await Product.find().lean();
        console.log(products);
        res.render('products',{products:products})
    }
    catch(error) {
        console.log(error.message);
    }
}





// add product
const addProduct=async (req,res)=> {
    try {
        console.log(req.body);
        const fileNames=req.files.map(file => file.filename);
        console.log(fileNames);
        const product=new Product({
            productName:req.body.productName,
            brandName:req.body.brandName,
            category:req.body.category,
            description:req.body.description,
            regularPrice:req.body.regularPrice,
            salePrice:req.body.salePrice,
            quantity:req.body.quantity,
            image:fileNames
        })
        console.log(product);
       const newProduct=await product.save();
        res.redirect('/admin/products')
    }
    catch(error) {
        console.log(error.message);
    }
}






// load edit product
const loadEditProduct=async (req,res)=> {
    try {
        const id=req.params.id;
        const category=await Category.find();
        Product.findById(id).then((data)=> {
            console.log(id);
            console.log(data);
            res.render('editProduct',{data:data,category:category});
        })
    }
    catch(error) {
        console.log(error.message);
    }
}






// edit product
const editProduct = async (req, res) => {
    try {
        console.log(req.body);
        const id = req.params.id;
        console.log('object id');
        console.log(id);
        const fileNamesU = req.files.map(file => file.filename);
        console.log(fileNamesU);
        const imgImp = req.body.imageImport.split(',');
        const imgArr = [...imgImp, ...fileNamesU];
        console.log(imgArr);

        const quantity = parseInt(req.body.quantity); 
        if (isNaN(quantity) || quantity < 0) {
            throw new Error("Quantity must be a non-negative number.");
        }

        const data = req.files.length ? {
            _id: id,
            productName: req.body.productName,
            brandName: req.body.brandName,
            category: req.body.category,
            description: req.body.description,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            quantity: quantity, 
            isListed: req.body.isListed,
            image: imgArr
        } : {
            _id: id,
            productName: req.body.productName,
            brandName: req.body.brandName,
            category: req.body.category,
            description: req.body.description,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            isListed: req.body.isListed,
            quantity: quantity 
        };
        console.log(data);
        await Product.findByIdAndUpdate(id, data);

        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
};










// delete product
const deleteProduct=async (req,res)=> {
    try {
        const id=req.params.id;
        console.log(id);
        await Product.findByIdAndDelete(id)
        res.redirect('/admin/products')
    }
    catch(error) {
        console.log(error.message);
    }
}








// delete product image
const deleteImage = async (req, res) => {
    const id = req.params.id;
    const img = req.params.img;

    try {
        const updatedDocument = await Product.findOneAndUpdate(
            { _id: id },
            { $pull: { image: img } },
            { new: true }
        );

        if (!updatedDocument) {
            console.log('Document not found');
            return res.status(404).json({ message: 'Document not found' });
        }

        const imagePath = path.join(__dirname, '../public/admin-assets/imgs/products', img);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'An error occurred while deleting the image' });
            }
            console.log('Image deleted successfully');
            res.redirect('/admin/edit-product/' + id);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred while deleting the element' });
    }
};







module.exports= {
    loadAddProduct,
    addProduct,
    loadProducts,
    loadEditProduct,
    editProduct,
    deleteProduct,
    deleteImage
}