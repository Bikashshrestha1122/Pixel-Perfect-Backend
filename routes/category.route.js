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

const handleDelete = async () => {

    const confirmDelete = window.confirm(
        `Are you sure you want to delete the category "${category?.name}"?`
    );
    if (!confirmDelete) return;

    try {
        await axios.delete(
            `${import.meta.env.VITE_API_URL}/categories/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        alert("Category deleted successfully!");
        navigate("/admin/categories");

    } catch (err) {
        console.error("Delete error:", err);
        setMessage(
            `Error Deleting Category: ${
                err.response?.data?.message || "Unknown error"
            }`
        );
    }
};
module.exports = Router;
