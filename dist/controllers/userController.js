"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateUser = exports.loginStatus = exports.getUser = exports.logoutUser = exports.loginUser = exports.registerUser = exports.responseWithError = exports.token = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, `${process.env.JWT_SECRET}`, { expiresIn: "1d" });
};
const responseWithError = (res, status = 500, err) => {
    res.status(status);
    throw new Error(err);
};
exports.responseWithError = responseWithError;
exports.registerUser = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = request;
    const { email, password, name } = body;
    // Validation
    if (!email || !password || !name || !body) {
        response.status(400);
        throw new Error('Please fill in all required fields');
        //responseWithError(response, 400, 'Please fill in all required fields');
    }
    if (email.trim() === '' || password.trim() === '' || name.trim() === '') {
        response.status(400);
        throw new Error('Please fill in all required fields');
        //responseWithError(response, 400, 'Please fill in all required fields');
    }
    if (password.length < 6) {
        response.status(400);
        throw new Error('Password must be up to 6 characters');
        // responseWithError(response, 400, 'Password must be up to 6 characters')
    }
    // Check if user email already exists
    const userExists = yield userModel_1.default.findOne({ email });
    if (userExists) {
        (0, exports.responseWithError)(response, 400, 'Email has already been registered');
    }
    // Create new user
    const user = yield userModel_1.default.create({
        name,
        email,
        password,
    });
    if (user) {
        const { _id, name, email, photo, bio, phone } = user;
        // Generate token
        const token = generateToken(_id);
        // Send HTTP-only cookie
        response.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),
            sameSite: "none",
            secure: true,
        });
        response.status(201);
        response.json({
            _id, name, email, photo, phone, bio, token,
        });
    }
    else {
        (0, exports.responseWithError)(response, 400, 'Invalid user data');
    }
}));
exports.loginUser = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = request.body;
    if (!email || !password) {
        (0, exports.responseWithError)(response, 400, 'Please add email and password');
    }
    ;
    // Check if user exist in database
    const userExists = yield userModel_1.default.findOne({ email });
    if (userExists === null) {
        response.status(400);
        throw new Error('User does not exist. Please sign up');
    }
    ;
    // Check if password is correct
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, userExists.password);
    if (userExists && isPasswordCorrect) {
        const { _id, name, email, photo, bio, phone } = userExists;
        // Generate token
        const token = generateToken(userExists._id);
        response.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400),
            sameSite: "none",
            secure: true,
        });
        response.status(200);
        response.json({
            _id, name, email, photo, phone, bio, token,
        });
    }
    else {
        (0, exports.responseWithError)(response, 400, 'Invalid email or password');
    }
    ;
}));
exports.logoutUser = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    response.status(200).json({ message: "Successfully logged out" });
}));
exports.getUser = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(request.user._id);
    if (user) {
        const { _id, name, email, photo, bio, phone } = user;
        response.status(200);
        response.json({
            _id, name, email, photo, phone, bio,
        });
    }
    else {
        (0, exports.responseWithError)(response, 400, 'User not found');
    }
}));
exports.loginStatus = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const token = request.cookies.token;
    if (!token) {
        response.json(false);
    }
    else {
        // Verify token
        const verified = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
        if (verified) {
            response.json(true);
        }
        else {
            response.json(false);
        }
        ;
    }
    response.end();
}));
exports.updateUser = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(request.user._id);
    if (user) {
        const { email, name, photo, bio, phone } = user;
        user.name = request.body.name || name;
        user.photo = request.body.photo || photo;
        user.bio = request.body.bio || bio;
        user.phone = request.body.phone || phone;
        const updatedUser = yield user.save();
        response.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    }
    else {
        (0, exports.responseWithError)(response, 400, 'User not found');
    }
}));
exports.changePassword = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(request.user._id);
    const { oldPassword, newPassword } = request.body;
    if (!user) {
        response.status(400);
        throw new Error('User does not exist. Please sign up');
    }
    ;
    if (!oldPassword || !newPassword) {
        (0, exports.responseWithError)(response, 400, "Please add old and new password");
    }
    ;
    if (newPassword.length < 6) {
        (0, exports.responseWithError)(response, 400, "New password must be up to 6 characters");
    }
    ;
    if (oldPassword === newPassword) {
        (0, exports.responseWithError)(response, 400, "New password is same as old password");
    }
    // Check if old password matches password in DB
    const passwordIsCorrect = yield bcryptjs_1.default.compare(oldPassword, user.password);
    // Save new password
    if (user && passwordIsCorrect) {
        user.password = newPassword;
        yield user.save();
        response.status(200).send('Password changed succesful');
    }
    else {
        (0, exports.responseWithError)(response, 400, "Old password is incorrect");
    }
}));
exports.forgotPassword = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = request.body;
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        response.status(404);
        throw new Error('User does not exist');
        //responseWithError(response, 404, 'User does not exist');
    }
    ;
    // Create reset token
    let resetToken = crypto_1.default.randomBytes(32).toString('hex') + user._id;
    console.log(resetToken);
    // Hash token before saving to DB
    const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    // Save token to DB
    yield new tokenModel_1.default({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000), // 30 minutes
    }).save();
    // Construct reset URL 
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    // Reset email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password.</p>
        <p>This reset link is valid for only 30 minutes.</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Regards...</p>
        <p>Pinvent Team</p>
    `;
    const subject = 'Password Reset Request Pinvent App';
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    try {
        yield (0, sendEmail_1.default)(subject, message, send_to, sent_from);
        response.status(200).json({
            success: true,
            message: "Reset email sent"
        });
    }
    catch (error) {
        (0, exports.responseWithError)(response, 500, 'Email not sent, please try again');
    }
}));
exports.resetPassword = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword } = request.body;
    const { resetToken } = request.params;
    if (!newPassword || newPassword.trim() === '') {
        (0, exports.responseWithError)(response, 400, 'Please add new password');
    }
    ;
    // Hash token, then compare it with hashed one in DB
    const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    const userToken = yield tokenModel_1.default.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });
    if (!userToken) {
        response.status(404);
        throw new Error("Invalid or expired token");
        //responseWithError(response, 404, 'Invalid or expired token')
    }
    ;
    // Find user
    const user = yield userModel_1.default.findById(userToken.userId);
    if (!user) {
        response.status(404);
        throw new Error("Invalid or expired token");
    }
    user.password = newPassword;
    yield user.save();
    response.status(200).json({
        message: 'Password has been reset successfully, please login',
    });
}));
