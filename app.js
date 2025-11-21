const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRouter = require('./routes/product.route');
const categoryRouter = require('./routes/category.route');
const cors = require('cors');
const port = process.env.PORT || 3000;

dotenv.config({quiet: true});

const app = express();
// app.use(cors());
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));






app.use('/api/products', productRouter );
app.use('/api/categories', categoryRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;