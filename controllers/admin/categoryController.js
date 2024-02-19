const Category=require('../../model/categoryModel')




// load category
const loadCategories=async (req,res)=> {
    try {
        const categories=await Category.find();
        req.session.categories=categories;
        res.render('categories',{categories:categories})
    }
    catch(error) {
        console.log(error.message);
    }
}







// load add category
const loadAddCategory=async (req,res)=> {
    try {
        res.render('addCategory')
    }
    catch(error) {
        console.log(error.message);
    }
}


const addCategory=async (req,res)=> {
    try {
        let category = new Category({
            name: req.body.name,
            description: req.body.description,
            isListed: req.body.isListed,
            image: req.file.filename
        });
        console.log(category);

        category=await category.save();

        if(category) {
            req.flash('successMessage','Category added successfully!');
            res.status(200).redirect('/admin/categories');
        }
        else {
            res.status(400).render('categories', {
                message:'Category adding failed.',
                categories:req.session.categories
            });
        }
    }
    catch(error) {
        if(error.code===11000 && error.keyPattern && error.keyPattern.name===1) {
            res.status(409).render('categories', {
                message:'Category name already exists.',
                categories:req.session.categories
            });
        }
        else {
            console.log(error.message);
            res.status(500).render('categories', {
                message:'An error occured while adding the category.',
                categories:req.session.categories
            });
        }
    }
};









// load edit category
const loadEditCategory=async (req,res)=> {
    try {
        let id=req.params.id;
        Category.findById(id).then((data)=> {
            console.log(id);
            console.log(data);
            res.render('categoryEdit',{data:data,errorMsg:req.session.errorMsg})
            req.session.errorMsg=false;
        })
        .catch((error)=> {
            console.log(error);
        })
    }
    catch(error) {
        console.log(error.message);
    }
}








// update category
const updateCategory = async (req, res) => {
    const id = req.params.id;
    try {
        console.log(req.body);
        console.log(req.file);
        const data = req.file ? {
            _id: id,
            name: req.body.name,
            image: req.file.fileName,
            isListed: req.body.isListed,
            description: req.body.description
        } : {
            _id: id,
            name: req.body.name,
            isListed: req.body.isListed,
            description: req.body.description
        };
        console.log(data);
        await Category.findByIdAndUpdate(id, data);
        req.session.errorMsg = false;

        res.redirect('/admin/categories');
        console.log(req.session.errorMsg);
    } catch (error) {
        console.log(error.message);
        req.session.errorMsg = 'Category duplicate found!, Update unsuccessful';
        console.log(req.session.errorMsg);

        res.redirect('/admin/categories-edit/' + id);
    }
};








// delete category
const deletecategory=async (req,res)=> {
    try {
        const id=req.params.id;
        await Category.findByIdAndDelete(id)
        res.redirect('/admin/categories')
    }
    catch(error) {
        console.log(error.message);
    }
}







module.exports= {
    loadCategories,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    updateCategory,
    deletecategory
}