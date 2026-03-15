const express = require('express');
const Router = express.Router();

const { postCategory, getCategories, getCategoryById } = require('../controllers/category.controller');
const Category = require('../models/category.model'); // adjust path/name if your model differs
const { authenticateAdmin } = require('../middlewares/auth.middleware');

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



Router.post('/', authenticateAdmin, postCategory);

Router.get('/', getCategories);

Router.get('/:id', getCategoryById);

Router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // check if category exists
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    // optional safety check
    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with products"
      });
    }

    // delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = Router;
