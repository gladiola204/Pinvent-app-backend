import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { responseWithError } from "./userController";
import sendEmail from "../utils/sendEmail";


export const contactWithUs = expressAsyncHandler(async (request: Request, response: Response) => {
    const { subject, message } = request.body;

    if(!subject || !message || subject.trim() === '' || message.trim() === '') {
        responseWithError(response, 400, 'Please add subject and message');
    };

    const send_to = process.env.EMAIL_USER as string;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = request.user.email;

    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to);
        response.status(200).json({
            success: true,
            message: "Reset email sent"
        })
    } catch (error) {
        responseWithError(response, 500, 'Email not sent, please try again')
    }
});