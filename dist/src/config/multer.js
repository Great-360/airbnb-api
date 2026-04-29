import multer from "multer";
const storage = multer.memoryStorage();
function fileFilter(req, file, cb) {
    const alloweTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (alloweTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images files are allowed (jpeg, jpg, png, webpg, gif)'));
    }
}
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
export default upload;
//# sourceMappingURL=multer.js.map