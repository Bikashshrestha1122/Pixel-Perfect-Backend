const mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  image: {
    url:{
      type: String,
      required: true,
    },
    public_id:{
      type: String,
      required: true,
    }
  },
  otherImages: [{
    url:{
      type: String,
    },
    public_id:{
      type: String,
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);  