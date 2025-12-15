const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const morgan = require('morgan');

const productRouter = require('./routes/product.route');
const categoryRouter = require('./routes/category.route');
const cors = require('cors');
const port = process.env.PORT || 3000;

dotenv.config({ quiet: true });

const app = express();
app.use(morgan('dev'));

app.use(cors({
  origin: [`${process.env.CORS_ORIGIN}`],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}))



connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
