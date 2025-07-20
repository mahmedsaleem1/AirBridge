import { Router } from "express";
import { SingleFileHandler,
        MultipleFileHandler
                            } from "../controllers/file.controller.js";

const router = Router();

router.route('/single-file').post(SingleFileHandler);

router.route('/multiple-files').post(MultipleFileHandler);

export default router;
