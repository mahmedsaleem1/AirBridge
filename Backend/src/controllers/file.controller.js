import { asyncHandler } from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';
import QRCode from 'qrcode';

export const SingleFileHandler = asyncHandler(async (req, res) => {
    const { fileName, url } = req.body;

    if (!fileName || !url) {
        throw new apiError(400, "File name and URL are required");
    }

    const qrCode = await QRCode.toDataURL(url);

    return res.status(200).json(
        new apiResponse("File retrieved successfully", {
            fileName,
            url,
            qrCode,
        })
    );
});

export const MultipleFileHandler = asyncHandler(async (req, res) => {
    const files = req.body; // array of { fileName, url }

    if (!Array.isArray(files) || files.length === 0) {
        throw new apiError(400, "Files array is required");
    }

    const filesWithQR = [];

    for (const file of files) {
        const { fileName, url } = file;

        if (!fileName || !url) continue;

        const qrCode = await QRCode.toDataURL(url);
        filesWithQR.push({ fileName, url, qrCode });
    }

    return res
        .status(200)
        .json(new apiResponse("Files retrieved successfully", filesWithQR));
});
