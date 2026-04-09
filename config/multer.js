const multer = require('multer');
const path = require('path');
// Set storage engine (use memory so we can stream to Cloudinary)
const storage = multer.memoryStorage();

// Initialize upload (5 MB limit, image-only)
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

const uploadProductImage = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'otherImages', maxCount: 5 },
]);

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
}

module.exports = {
    upload,
    uploadProductImage,
};