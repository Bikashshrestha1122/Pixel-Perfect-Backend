const mongoose = require('mongoose');

let categorySchema  = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
    }],
}, { timestamps: true });

module.exports = mongoose.model('category', categorySchema);