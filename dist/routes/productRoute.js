"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const productController_1 = require("../controllers/productController");
const uploadFiles_1 = require("../utils/uploadFiles");
exports.productRouter = express_1.default.Router();
exports.productRouter.post('/', authMiddleware_1.protection, uploadFiles_1.upload.single('image'), productController_1.createProduct);
exports.productRouter.patch('/:id', authMiddleware_1.protection, uploadFiles_1.upload.single('image'), productController_1.updateProduct);
exports.productRouter.get('/', authMiddleware_1.protection, productController_1.getProducts);
exports.productRouter.get('/:id', authMiddleware_1.protection, productController_1.getProduct);
exports.productRouter.delete('/:id', authMiddleware_1.protection, productController_1.deleteProduct);
