"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const contactController_1 = require("../controllers/contactController");
exports.contactRouter = (0, express_1.Router)();
exports.contactRouter.post('/', authMiddleware_1.protection, contactController_1.contactWithUs);
