import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})

export const handleCloudinaryUpload = (req, res) => {

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: "chatApp" },
        process.env.API_SECRET
    );

    res.json({
        timestamp,
        signature,
        folder: "chatApp",
        apiKey: process.env.API_KEY,
        cloudName: process.env.CLOUD_NAME,
    });
};