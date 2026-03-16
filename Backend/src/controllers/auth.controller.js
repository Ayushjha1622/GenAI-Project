const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

/**
 * @name registerUserController
 * @route POST /api/auth/register
 * @desc Register a new user, expects username, email and password in the request body
 * @access Public
*/

async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    const isUserAlreadyExists = await userModel.findOne({
         $or: [{ username }, { email }] 
        });
        
        
    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "Username or email already taken" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    });


    const token = jwt.sign(
        { id: user._id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );

    res.cookie('token', token)
    res.status(201).json({
        message: "User registered successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name loginUserController
 * @route POST /api/auth/login
 * @desc Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide both email and password" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or Password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or Password" });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', token);
    res.status(200).json({
        message: "Login successful",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}


/**
 * @name logoutUserController
 * @route POST /api/auth/logout
 * @desc clear token from user cookie and add the token in blacklist
 * @access Public
 */

async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if(token) {
        await tokenBlacklistModel.create({ token });
    }
    res.clearCookie('token');
    res.status(200).json({ message: "Logout successful" });

}

/**
 * @route GET /api/auth/get-me
 * @desc Get the currently logged in user's information
 * @access Private
 */

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: "User information retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


module.exports = {
   registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}