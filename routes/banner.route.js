const express = require('express');
const { postBanner, getBanner, updateBanner, deleteBanner, getOneBanner, } = require('../controllers/banner.controller');
const { authenticateAdmin } = require('../middlewares/auth.middleware');
const { upload } = require('../config/multer');

let Router = express.Router()



Router.post("/", authenticateAdmin, upload.single("image"), postBanner)

Router.get("/", getBanner)

Router.get("/:id", getOneBanner)

Router.put("/:id", authenticateAdmin, updateBanner)

Router.delete("/:id", authenticateAdmin, deleteBanner)


module.exports = Router;