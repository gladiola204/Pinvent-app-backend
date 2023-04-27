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
exports.protection = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userController_1 = require("../controllers/userController");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
exports.protection = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            (0, userController_1.responseWithError)(res, 401, 'Not authorized, please login');
        }
        // Verify token
        const verified = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
        // Get user id from token
        const user = yield userModel_1.default.findById(verified.id).select("-password");
        if (!user) {
            (0, userController_1.responseWithError)(res, 401, 'User not found');
        }
        ;
        req.user = user;
        next();
    }
    catch (error) {
        (0, userController_1.responseWithError)(res, 400, error.message);
    }
}));
