import {asyncHandler} from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';

export const SingleFileHandler = asyncHandler(async (req, res) => {
    const { fileName, url } = req.body;        

    if ( !fileName || !url) {
        throw new apiError(400, "File name and URL are required");  
    }
    return res
            .status(200)
            .json(new apiResponse("File retrieved successfully", { fileName, url }));
});

export const MultipleFileHandler = asyncHandler(async (req, res) => {
    const files = req.body; // array of { filename, url }
    
    let fileObj = {};

    for (let i = 0; i < files.length; i++) {
        const { filename, url } = files[i];
        fileObj[filename] = url;
    }

    if (!fileObj) throw new apiError(400, "File name and URL are required");

    return res
        .status(200)
        .json(new apiResponse("Files retrieved successfully", fileObj));
});