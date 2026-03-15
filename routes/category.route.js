const express = require("express");
const Router = express.Router();
const Category = require("../models/category.model");
const { authenticateAdmin } = require("../middlewares/auth.middleware");

// Create category, get categories, get by ID...
// (keep your existing routes for GET and POST)


// DELETE CATEGORY BY ID
Router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Delete request received for category ID:", id);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Optional: prevent deleting if category has products
    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with products"
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = Router;
