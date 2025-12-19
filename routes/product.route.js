const express = require('express');
const Router = express.Router();
const Product = require('../models/product.model');
let { uploadProductImage } = require('../config/multer');
const { postProduct, getProductBYId, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { authenticateAdmin } = require('../middlewares/auth.middleware');




// Create a new product
Router.post('/', authenticateAdmin, uploadProductImage, postProduct);


// GET /products?page=1&limit=10
Router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { category, populate, dashboard } = req.query;

        const skip = (page - 1) * limit;

        const q = category ? { category } : {};

        let query = Product.find(q)
            .skip(skip)
            .limit(limit);

        // Sort for dashboard mode
        query = query.sort({ createdAt: -1 });  // newest first


        // Conditional populate
        if (populate === 'true') {
            query = query.populate({
                path: 'category',
                select: 'name description'
            });
        }

        const [products, total] = await Promise.all([
            query.exec(),
            Product.countDocuments(q)
        ]);

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            products
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



Router.get('/recent', async (req, res) => {
    try {
        const populateCategory = req.query.populate === 'true';
        let q = Product.find().sort({ createdAt: -1 }).limit(6);
        if (populateCategory) q = q.populate({
            path: 'category',
            select: 'name description'
        });
        const products = await q.exec();

        res.json({ count: products.length, products });
    } catch (error) {
        console.error('Recent products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get a product by ID
Router.get('/:id', getProductBYId);

// Update a product by ID
Router.put('/:id', authenticateAdmin, updateProduct);

// Delete a product by ID
Router.delete('/:id', authenticateAdmin, deleteProduct);


module.exports = Router;
