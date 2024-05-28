import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, changeUserAvatar, changeUserCoverImage } from '../controllers/user.controller.js'
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

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verfifyJWT, changeCurrentPassword)

router.route('/current-user').get(verfifyJWT, getCurrentUser)

router.route('/change-avatar').post(verfifyJWT, upload.single('avatar'), changeUserAvatar)
router.route('/change-cover-image').post(verfifyJWT, upload.single('coverImage'), changeUserCoverImage)

export default router