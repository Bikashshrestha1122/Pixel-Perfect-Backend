const Product = require('../models/product.model');
const Category = require('../models/category.model');
const cloudinary = require('../config/cloudinary');


function uploadBufferToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        stream.end(buffer);
    });
}



// Create a new product
const postProduct = async (req, res) => {
    try {
        let { name, description, price, category, inStock } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Required fields: name and price' });
        }



        const productPayload = {
            name: name.trim(),
            description: description || '',
            price: Number(price),
            category: category || undefined, // Mongoose will cast to ObjectId if needed
            inStock,
            image: { url: '', public_id: '' },
            otherImages: [],
        };


        // Upload main image to Cloudinary 
        if (req.files && req.files.image && req.files.image.length) {
            const result = await uploadBufferToCloudinary(req.files.image[0].buffer, "products");
            productPayload.image = { url: result.secure_url, public_id: result.public_id };
        }

        // Upload other images to Cloudinary 
        if (req.files && req.files.otherImages && req.files.otherImages.length) {
            const uploadPromises = req.files.otherImages.map(file =>
                uploadBufferToCloudinary(file.buffer, "products")
            );
            const results = await Promise.all(uploadPromises);
            productPayload.otherImages = results.map(r => ({ url: r.secure_url, public_id: r.public_id }));
        } else {
            productPayload.otherImages = [];
        }

        const product = new Product(productPayload);
        await product.save();

        if (product.category) {
            await Category.findByIdAndUpdate(product.category, { $push: { products: product._id } });
        }

        // await product.populate('category');

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);

    }
}

const getAllProducts = async (req, res) => {
    try {
        let query = req.query.populate === 'true';
        const products = query ? await Product.find().populate('category').sort({ createdAt: -1 }) : await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getProductBYId = async (req, res) => {
    try {
        let query = req.query.populate === 'true';

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid Product ID' });
        }

        const product = query ? await Product.findById(req.params.id).populate('category') : await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const mongoose = require('mongoose');

const updateProduct = async (req, res) => {
    try {
        const allowedFields = ['name', 'description', 'price', 'category', 'inStock'];
        const updateData = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updateData[field] = req.body[field];
            }
        }

        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || !updateData.name.trim()) {
                return res.status(400).json({ error: 'Invalid name' });
            }
            updateData.name = updateData.name.trim();
        }

        if (updateData.price !== undefined) {
            const parsedPrice = Number(updateData.price);
            if (Number.isNaN(parsedPrice)) {
                return res.status(400).json({ error: 'Price must be a number' });
            }
            updateData.price = parsedPrice;
        }

        if (updateData.inStock !== undefined) {
            if (typeof updateData.inStock === 'string') {
                updateData.inStock = updateData.inStock === 'true';
            } else {
                updateData.inStock = Boolean(updateData.inStock);
            }
        }

        // Fetch existing product
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const oldCategoryId = existingProduct.category?.toString();
        const newCategoryId = updateData.category?.toString();

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Sync categories
        if (newCategoryId && newCategoryId !== oldCategoryId) {

            if (oldCategoryId) {
                await Category.findByIdAndUpdate(
                    oldCategoryId,
                    { $pull: { products: updatedProduct._id } }
                );
            }

            await Category.findByIdAndUpdate(
                newCategoryId,
                { $addToSet: { products: updatedProduct._id } }
            );
        }

        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Gather Cloudinary public_ids to delete
        const publicIds = [];
        if (product.image && product.image.public_id) publicIds.push(product.image.public_id);
        if (Array.isArray(product.otherImages)) {
            product.otherImages.forEach(img => {
                if (img && img.public_id) publicIds.push(img.public_id);
            });
        }

        // Delete images from Cloudinary (use Promise.allSettled so one failure won't block the rest)
        if (publicIds.length) {
            await Promise.allSettled(publicIds.map(id =>
                new Promise((resolve) => {
                    cloudinary.uploader.destroy(id, (err, result) => resolve({ id, err, result }));
                })
            ));
        }

        // Delete product document
        await Product.findByIdAndDelete(req.params.id);

        // Remove reference from category's products array if applicable
        if (product.category) {
            await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });
        }

        res.status(200).json({ message: 'Product and associated images deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    postProduct,
    getAllProducts,
    getProductBYId,
    updateProduct,
    deleteProduct
};  
