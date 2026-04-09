const mongoose = require("mongoose")

const BannerModel = require('../models/banner.model')
const cloudinary = require('cloudinary').v2;


const postBanner = async (req, res) => {
    let uploadResult;

    try {
        const { title, desc, link } = req.body;

        if (!title || !desc || !link || !req.file) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "banners" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        const bannerData = {
            title,
            desc,
            link,
            image: uploadResult.secure_url
        };

        const banner = await BannerModel.create(bannerData);

        return res.status(201).json({
            message: "Banner uploaded successfully",
            banner
        });

    } catch (error) {
        if (uploadResult?.public_id) {
            await cloudinary.uploader.destroy(uploadResult.public_id);
        }

        return res.status(500).json({
            message: "Error uploading banner",
            error: error.message
        });
    }
};



const getBanner = async (req, res) => {
    try {
        const banners = await BannerModel.find();

        return res.status(200).json({
            message: "Banners retrieved successfully",
            banners
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving banners",
            error: error.message
        });
    }
}

const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid banner ID"
            });
        }

        const { title, desc, link } = req.body;

        if (!title || !desc || !link) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const banner = await BannerModel.findByIdAndUpdate(
            id,
            { title, desc, link },
            { new: true }
        );

        if (!banner) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }

        return res.status(200).json({
            message: "Banner updated successfully",
            banner
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating banner",
            error: error.message
        });
    }
}

const getOneBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid banner ID"
            });
        }
        const banner = await BannerModel.findById(id);

        if (!banner) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }

        return res.status(200).json({
            message: "Banner retrieved successfully",
            banner
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving banner",
            error: error.message
        });
    }
}

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid banner ID"
            });
        }

        const banner = await BannerModel.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }

        if (banner.image) {
            const publicId = banner.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`banners/${publicId}`);
        }

        return res.status(200).json({
            message: "Banner deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting banner",
            error: error.message
        });
    }

}

module.exports = { postBanner, getBanner, updateBanner, deleteBanner, getOneBanner }