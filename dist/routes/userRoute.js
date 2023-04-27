"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userRouter = express_1.default.Router();
userRouter.post('/register', userController_1.registerUser);
userRouter.post('/login', userController_1.loginUser);
userRouter.get('/logout', userController_1.logoutUser);
userRouter.get('/getuser', authMiddleware_1.protection, userController_1.getUser);
userRouter.get('/loggedin', userController_1.loginStatus);
userRouter.patch('/updateuser', authMiddleware_1.protection, userController_1.updateUser);
userRouter.patch('/changepassword', authMiddleware_1.protection, userController_1.changePassword);
userRouter.post('/forgotpassword', userController_1.forgotPassword);
userRouter.put('/resetpassword/:resetToken', userController_1.resetPassword);
exports.default = userRouter;
