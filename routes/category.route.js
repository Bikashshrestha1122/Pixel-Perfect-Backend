const express = require('express');
const Router = express.Router();

const { postCategory, getCategories, getCategoryById } = require('../controllers/category.controller');
const Category = require('../models/category.model'); // adjust path/name if your model differs

Router.get("/search", async (req, res) => {
    try {
        let { query } = req.query;
        query = query?.toLowerCase();

        // If no search text, return empty array
        if (!query) {
            
            return res.json([]);
        }

        const categories = await Category.find({
            name: { $regex: query, $options: "i" }, // i = case-insensitive
        });

        res.json(categories);
    } catch (error) {
        console.error("Search route error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



Router.post('/', postCategory);

Router.get('/', getCategories);

Router.get('/:id', getCategoryById);

Router.delete('/:name', async (req, res) => {
    try {
        let name = req.params.name.toLowerCase();
        const category = await Category.findOne({name});
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        
        if (category.products && category.products.length > 0) {
            return res.status(400).json({ message: "Cannot delete category with products" });
        }

        await Category.findOneAndDelete({name});
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = Router;