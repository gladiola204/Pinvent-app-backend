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
exports.updateProduct = exports.deleteProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userController_1 = require("./userController");
const productModel_1 = __importDefault(require("../models/productModel"));
const uploadFiles_1 = require("../utils/uploadFiles");
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.createProduct = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, sku, category, quantity, price, description } = request.body;
    if (!name || !category || !quantity || !price || !description) {
        (0, userController_1.responseWithError)(response, 400, 'Please fill in all fields');
    }
    ;
    // Handle image upload
    let fileData = {};
    if (request.file) {
        let uploadedFile;
        try {
            uploadedFile = yield cloudinary_1.default.v2.uploader.upload(request.file.path, { folder: 'Pinvent App', resource_type: 'image' });
        }
        catch (error) {
            (0, userController_1.responseWithError)(response, 500, 'Image could not be uploaded');
        }
        ;
        fileData = {
            fileName: request.file.originalname,
            filePath: uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.secure_url,
            fileType: request.file.mimetype,
            fileSize: (0, uploadFiles_1.fileSizeFormatter)(request.file.size, 2),
        };
    }
    ;
    const product = yield productModel_1.default.create({
        user: request.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    });
    response.status(201).json(product);
}));
exports.getProducts = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield productModel_1.default.find({ user: request.user.id }).sort('-createdAt');
    response.status(200).json(products);
}));
exports.getProduct = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productModel_1.default.findById(request.params.id);
    if (!product) {
        response.status(404);
        throw new Error('Product not found');
        //responseWithError(response, 404, 'Product not found');
    }
    ;
    if (product.user.toString() !== request.user.id) {
        (0, userController_1.responseWithError)(response, 401, 'User not authorized');
    }
    ;
    response.status(200).json(product);
}));
exports.deleteProduct = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productModel_1.default.findById(request.params.id);
    if (!product) {
        response.status(404);
        throw new Error('Product not found');
        //responseWithError(response, 404, 'Product not found');
    }
    ;
    if (product.user.toString() !== request.user.id) {
        (0, userController_1.responseWithError)(response, 401, 'User not authorized');
    }
    ;
    yield product.deleteOne();
    response.status(200).json({ message: 'Product deleted succesfully' });
}));
exports.updateProduct = (0, express_async_handler_1.default)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category, quantity, price, description } = request.body;
    const { id } = request.params;
    const product = yield productModel_1.default.findById(id);
    if (!product) {
        response.status(404);
        throw new Error('Product not found');
    }
    ;
    if (product.user.toString() !== request.user.id) {
        (0, userController_1.responseWithError)(response, 401, 'User not authorized');
    }
    ;
    // Handle image upload
    let fileData = {};
    if (request.file) {
        let uploadedFile;
        try {
            uploadedFile = yield cloudinary_1.default.v2.uploader.upload(request.file.path, { folder: 'Pinvent App', resource_type: 'image' });
        }
        catch (error) {
            (0, userController_1.responseWithError)(response, 500, 'Image could not be uploaded');
        }
        ;
        fileData = {
            fileName: request.file.originalname,
            filePath: uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.secure_url,
            fileType: request.file.mimetype,
            fileSize: (0, uploadFiles_1.fileSizeFormatter)(request.file.size, 2),
        };
    }
    ;
    //Update Product
    const updatedProduct = yield productModel_1.default.findByIdAndUpdate({ _id: id }, {
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0 ? product === null || product === void 0 ? void 0 : product.image : fileData,
    }, {
        new: true,
        runValidators: true,
    });
    response.status(200).json(updatedProduct);
}));
