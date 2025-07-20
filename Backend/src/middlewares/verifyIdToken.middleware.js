// middlewares/verifyFirebaseToken.js
import { admin } from '../firebase/firebase.js';
import apiError from '../utils/apiError.js';

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new apiError(401, "No token provided"));
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // attach user info to request    
    
    next();
  } catch (error) {
    return next(new apiError(401, "Invalid or expired token"));
  }
};
