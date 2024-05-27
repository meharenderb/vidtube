import { Router } from "express";
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verfifyJWT } from "../middlewares/verify_jwt.middleware.js";
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(verfifyJWT, logoutUser)

export default router