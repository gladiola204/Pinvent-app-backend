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
exports.contactWithUs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userController_1 = require("./userController");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
exports.contactWithUs = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, message } = request.body;
    if (!subject || !message || subject.trim() === '' || message.trim() === '') {
        (0, userController_1.responseWithError)(response, 400, 'Please add subject and message');
    }
    ;
    const send_to = process.env.EMAIL_USER;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = request.user.email;
    try {
        yield (0, sendEmail_1.default)(subject, message, send_to, sent_from, reply_to);
        response.status(200).json({
            success: true,
            message: "Reset email sent"
        });
    }
    catch (error) {
        (0, userController_1.responseWithError)(response, 500, 'Email not sent, please try again');
    }
}));
