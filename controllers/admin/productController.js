const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const fs = require("fs");
const path = require("path");





// load add product
const loadAddProduct = async (req, res) => {
  try {
    const category = await Category.find();
    res.render("addProduct", { category: category });
  } catch (error) {
    res.redirect('/error')
    
  }
};





// load products
const loadProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = 5;
  const skip = (page - 1) * pageSize; 

  try {
    const products = await Product.find().skip(skip).limit(pageSize).lean();
    
    const categories = await Category.find();

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / pageSize);

    res.render("products", { 
      products: products, 
      categories: categories, 
      currentPage: page, 
      totalPages: totalPages 
    });
  } catch (error) {
    res.redirect('/error')
    
  }
};






// add product
const addProduct = async (req, res) => {
  const { productName, brandName, description, regularPrice, salePrice, quantity, category: categoryName } = req.body;
  const fileNames = req.files.map(file => file.filename);

  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) throw new Error("Category not found");

    const newProduct = new Product({
      productName, brandName, description, regularPrice, salePrice, quantity,
      category: category._id, image: fileNames
    });

    await newProduct.save();
    res.redirect("/admin/products");
  } catch (error) {
    handleError(res, error);
  }
};






// load edit product
const loadEditProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.find();
    Product.findById(id).then((data) => {
      console.log(id);
      console.log(data);
      res.render("editProduct", { data: data, category: category });
    });
  } catch (error) {
    res.redirect('/error')
    
  }
};







// edit product
const editProduct = async (req, res) => {
  try {
    const id = req.params.id; 
    const fileNamesU = req.files.map((file) => file.filename); 
    const imgImp = req.body.imageImport.split(","); 
    const imgArr = [...imgImp, ...fileNamesU]; 

    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Quantity must be a non-negative number.");
    }

    const category = await Category.findOne({ name: req.body.category });
    if (!category) {
      console.error("Category not found");
      return res.status(404).send("Category not found");
    }

    const data = {
      productName: req.body.productName,
      brandName: req.body.brandName,
      category: category._id, 
      description: req.body.description,
      regularPrice: req.body.regularPrice,
      salePrice: req.body.salePrice,
      quantity: quantity,
      isListed: req.body.isListed === 'on', 
      image: imgArr,
    };

    await Product.findByIdAndUpdate(id, data);
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    res.redirect('/error');
  }
};








const softDeleteProduct = async (req, res) => {
  try {
      const id = req.params.id;

      console.log("request params", req.params.id);
      const product_isActive = await Product.findById(id);
      if (product_isActive.isListed) {
      console.log(product_isActive.isListed);
      await Product.findByIdAndUpdate(id, { isListed: false });
      }
      if (!product_isActive.isListed) {
      console.log(product_isActive.isListed);
      await Product.findByIdAndUpdate(id, { isListed: true });
      }

      res.redirect("/admin/products");
  } catch (error) {
    res.redirect('/error')
    
  }
};







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
      console.log("Document not found");
      return res.status(404).json({ message: "Document not found" });
    }

    const imagePath = path.join(
      __dirname,
      "../public/admin-assets/imgs/products",
      img
    );

    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File doesn't exist, can't delete:", imagePath);
      }

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("An error occurred while deleting the image:", err);
        }
        console.log("Image deleted successfully");
        res.redirect("/admin/edit-product/" + id);
      });
    });
  } 
  catch (error) {
    res.redirect('/error')
    
  }
};






module.exports = {
  loadAddProduct,
  addProduct,
  loadProducts,
  loadEditProduct,
  editProduct,
  softDeleteProduct,
  deleteImage,
};
