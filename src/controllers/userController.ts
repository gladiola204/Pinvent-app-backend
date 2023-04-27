import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from "mongoose";
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import Token from "../models/tokenModel";
import sendEmail from "../utils/sendEmail";

export let token: string;

const generateToken = (id: Types.ObjectId) => {
    return jwt.sign({id}, `${process.env.JWT_SECRET}`, {expiresIn: "1d"});
}

export const responseWithError = (res: Response, status = 500, err: string) => {
    res.status(status);
    throw new Error(err);
};

export const registerUser = expressAsyncHandler( async (request: Request, response: Response) => {
    const { body } = request;
    const { email, password, name } = body;

    
    // Validation
    if(!email || !password || !name || !body) {
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
    const userExists = await User.findOne({email})

    if(userExists) {
        responseWithError(response, 400, 'Email has already been registered')
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    if(user) {
        const { _id, name, email, photo, bio, phone } = user;
        // Generate token
        const token = generateToken(_id);

        // Send HTTP-only cookie
        response.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        });
        
        response.status(201);
        response.json({
            _id, name, email, photo, phone, bio, token,
        });
    } else {
        responseWithError(response, 400, 'Invalid user data');
    }
});

export const loginUser = expressAsyncHandler( async (request: Request, response: Response) => {
    const { email, password } = request.body;

    if(!email || !password) {
        responseWithError(response, 400, 'Please add email and password');
    };

    // Check if user exist in database
    const userExists = await User.findOne({email});
    
    if(userExists === null) {
        response.status(400);
        throw new Error('User does not exist. Please sign up');
    };

    // Check if password is correct
    const isPasswordCorrect = await bcryptjs.compare(password, userExists.password);

    if(userExists && isPasswordCorrect) {
        const { _id, name, email, photo, bio, phone } = userExists;

        // Generate token
        const token = generateToken(userExists._id);

        response.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
            domain: "vercel.app"
        });

        response.status(200);
        response.json({
            _id, name, email, photo, phone, bio, token,
        });
    } else {
        responseWithError(response, 400, 'Invalid email or password');
    };
});

export const logoutUser = expressAsyncHandler( async (request: Request, response: Response) => {
    response.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0), // expires now
        sameSite: "none",
        secure: true,
    });
    response.status(200).json({ message: "Successfully logged out" })
});

export const getUser = expressAsyncHandler( async (request: Request, response: Response) => {
    const user = await User.findById(request.user._id);

    if(user) {
        const { _id, name, email, photo, bio, phone } = user;
        response.status(200);
        response.json({
            _id, name, email, photo, phone, bio,
        });
    } else {
        responseWithError(response, 400, 'User not found');
    }
});

export const loginStatus = expressAsyncHandler(async (request: Request, response: Response) => {
    const token = request.cookies.token;

    if(!token) {
        response.json(false);
    } else {
        // Verify token
        const verified = jwt.verify(token, `${process.env.JWT_SECRET}`);
    
        if(verified) {
            response.json(true);
        } else {
            response.json(false);
        };
    }
    response.end();
});

export const updateUser = expressAsyncHandler(async (request: Request, response: Response) => {
    const user = await User.findById(request.user._id);
    if (user) {
        const { email, name, photo, bio, phone } = user;
        user.name = request.body.name || name;
        user.photo = request.body.photo || photo;
        user.bio = request.body.bio || bio;
        user.phone = request.body.phone || phone;

        const updatedUser = await user.save();

        response.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name, 
            email, 
            photo: updatedUser.photo, 
            phone: updatedUser.phone, 
            bio: updatedUser.bio,
        });
    } else {
        responseWithError(response, 400, 'User not found');
    }
});

export const changePassword = expressAsyncHandler(async (request: Request, response: Response) => {
    const user = await User.findById(request.user._id);
    const { oldPassword, newPassword } = request.body;

    if(!user) {
        response.status(400);
        throw new Error('User does not exist. Please sign up');
    };
    if(!oldPassword || !newPassword) {
        responseWithError(response, 400, "Please add old and new password");
    };
    if (newPassword.length < 6) {
        responseWithError(response, 400, "New password must be up to 6 characters");
    };
    if(oldPassword === newPassword) {
        responseWithError(response, 400, "New password is same as old password");
    } 

    // Check if old password matches password in DB
    const passwordIsCorrect = await bcryptjs.compare(oldPassword, user.password)

    // Save new password
    if(user && passwordIsCorrect) {
        user.password = newPassword;

        await user.save();

        response.status(200).send('Password changed succesful');
    } else {
        responseWithError(response, 400, "Old password is incorrect")
    }
});

export const forgotPassword = expressAsyncHandler(async (request: Request, response: Response) => {
    const { email } = request.body;
    const user = await User.findOne({ email });

    if(!user) {
        response.status(404);
        throw new Error('User does not exist')
        //responseWithError(response, 404, 'User does not exist');
    };

    // Create reset token
    let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
    console.log(resetToken);
    // Hash token before saving to DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to DB
    await new Token({
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
    const sent_from = process.env.EMAIL_USER as string;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        response.status(200).json({
            success: true,
            message: "Reset email sent"
        })
    } catch (error) {
        responseWithError(response, 500, 'Email not sent, please try again')
    }

})

export const resetPassword = expressAsyncHandler(async (request: Request, response: Response) => {
    const { newPassword } = request.body;
    const { resetToken } = request.params;

    if(!newPassword || newPassword.trim() === '') {
        responseWithError(response, 400, 'Please add new password');
    };

    // Hash token, then compare it with hashed one in DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()},
    });

    if(!userToken) {
        response.status(404);
        throw new Error("Invalid or expired token")
        //responseWithError(response, 404, 'Invalid or expired token')
    };

    // Find user
    const user = await User.findById(userToken.userId);

    if(!user) {
        response.status(404);
        throw new Error("Invalid or expired token");
    }
    user.password = newPassword;
    await user.save();
    response.status(200).json({
        message: 'Password has been reset successfully, please login',
    });

});