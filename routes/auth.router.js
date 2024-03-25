import { Router } from "express";
import { register,LogIn, LogOut } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";
const router=Router();
router.get('/register',
upload.fields([
    {
        name:'avtar',
        maxCount:1
    },
    {
        name:'CoverImage',
        maxCount:1
    }
]),
register);
router.post('/login',LogIn);
router.post('/logout',verifyJWT,LogOut);
export default router;