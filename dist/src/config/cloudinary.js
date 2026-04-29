import { v2 as cloudinary } from "cloudinary";
const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};
cloudinary.config(config);
export async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_chunked_stream({
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
export async function deleteFromCloudinary(publicId) {
    await cloudinary.uploader.destroy(publicId);
}
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map