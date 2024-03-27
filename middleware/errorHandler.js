const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errorPage');
};


module.exports = errorHandler;
