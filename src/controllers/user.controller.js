import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/apiError.js'
import { uploadCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'

// GENERATE ACCESS/REFRESH TOKEN
const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong! while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    console.log("Body:: ", req.body);
    const { username, email, fullName, password } = req.body;

    // validation - not empty
    if ([username, email, fullName, password].some((field) => {
        if (typeof field == 'string') {
            return field?.trim() === ''
        }
    }
    )) {
        throw new ApiError(400, "All fields are required")
    }
    // check if user already exists: username/email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }
    // upload them to cloudinary, avatar
    const avatar = await uploadCloudinary(avatarLocalPath)

    let coverImage = null
    if (req.files?.coverImage && req.files?.coverImage?.length > 0) {
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        coverImage = await uploadCloudinary(coverImageLocalPath)
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    })

    // check for user creation
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // return null
    const { username, email, password } = req.body

    // check username, email, password
    if (!(username || email)) {
        throw new ApiError(400, 'Username or email is required')
    }

    // check if user is exists fro email/username
    const fetchedUser = await User.findOne({
        $or: [{ username: username }, { email: email }]
    })


    if (!fetchedUser) {
        throw new ApiError(404, "User does not exist")
    }
    // validate user entered password with db password
    const isPasswordValid = await fetchedUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid user credentials")
    }

    // generate access/refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(fetchedUser._id)

    // remove un-neccessary fields from user object
    const loggedInUser = await User.findById(fetchedUser._id).select('-password')

    // send response and access token in cookies
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { loggedInUser, accessToken })
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    // update refresh token using user id using middleware
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    // remove cookies
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, null, 'User Logged Out Successfully!')
        )
})

export { registerUser, loginUser, logoutUser }