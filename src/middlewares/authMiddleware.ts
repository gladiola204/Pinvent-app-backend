import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { responseWithError } from "../controllers/userController";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from "../models/userModel";

export const protection = expressAsyncHandler( async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        
        if(!token) {
            responseWithError(res, 401, 'Not authorized, please login')
        }

        // Verify token
        const verified = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;

        // Get user id from token
        const user = await User.findById(verified.id).select("-password");

        if(!user) {
            responseWithError(res, 401, 'User not found');
        };
        req.user = user;
        next();

    } catch (error: any) {
        responseWithError(res, 400, error.message);
    }
});