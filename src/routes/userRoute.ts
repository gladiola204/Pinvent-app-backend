import express from 'express';
import { changePassword, forgotPassword, getUser, loginStatus, loginUser, logoutUser, registerUser, resetPassword, updateUser } from '../controllers/userController';
import { protection } from '../middlewares/authMiddleware';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/logout', logoutUser);
userRouter.get('/getuser', protection, getUser);
userRouter.get('/loggedin', loginStatus);
userRouter.patch('/updateuser', protection, updateUser);
userRouter.patch('/changepassword', protection, changePassword);
userRouter.post('/forgotpassword', forgotPassword);
userRouter.put('/resetpassword/:resetToken', resetPassword);

export default userRouter;