"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
exports.deleteFromCloudinary = deleteFromCloudinary;
const cloudinary_1 = require("cloudinary");
const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};
cloudinary_1.v2.config(config);
async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_chunked_stream({
            folder,
            resource_type: "auto",
        }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        stream.end(buffer);
    });
}
async function deleteFromCloudinary(publicId) {
    await cloudinary_1.v2.uploader.destroy(publicId);
}
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map