import { Router } from "express";
import {
    registerWithEmail,
    resetPassword,
    googleLogin,
    loginWithIdToken,

} from "../controllers/auth.controller.js";

import { verifyFirebaseToken } from "../middlewares/verifyIdToken.middleware.js";

const router = Router();

router.route("/signup").post(registerWithEmail);
router.route("/login").post(verifyFirebaseToken, loginWithIdToken);
router.route("/reset-password").post(resetPassword);
router.post('/google-login', verifyFirebaseToken, googleLogin);



export default router;