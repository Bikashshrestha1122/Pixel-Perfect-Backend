const Category = require('../models/category.model');
const { listenerCount } = require('../models/product.model');
const mongoose = require('mongoose');

const postCategory = async (req, res) => {
    try {``
        let { name, description } = req.body;
        name = name.toLowerCase();
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        let pullName = await Category.findOne({ name: name });
        if (pullName) {
            return res.status(400).json({ error: 'Category name must be unique' });
        }
        const category = new Category({
            name,
            description
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getCategories = async (req, res) => {
    try {
        const populate = req.query.populate === 'true';
        const page = Math.max(parseInt(req.params.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.params.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await Category.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const categories = populate
            ? await Category.find().populate('products').skip(skip).limit(limit)
            : await Category.find().skip(skip).limit(limit);

        res.status(200).json({
            data: categories,
            pagination: {
                total,
                totalPages,
                page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getCategoryById = async (req, res) => {
    try {
        const populate = req.query.populate === 'true';
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid category ID' });
        }

        // If no population requested, just return the category
        if (!populate) {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            return res.status(200).json(category);
        }

        // Load the category to get total products count (assumes Category has a products array of refs)
        const categoryForCount = await Category.findById(req.params.id).select('products');
        if (!categoryForCount) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const totalProducts = Array.isArray(categoryForCount.products) ? categoryForCount.products.length : 0;
        const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);
        const skip = (page - 1) * limit;

        // Populate products with pagination
        const populatedCategory = await Category.findById(req.params.id).populate({
            path: 'products',
            options: { skip, limit }
        });

        // Return category plus pagination metadata
        return res.status(200).json({
            ...populatedCategory.toObject(),
            pagination: {
                totalProducts,
                totalPages,
                page,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { postCategory, getCategories, getCategoryById };