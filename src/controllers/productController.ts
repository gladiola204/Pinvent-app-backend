import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { responseWithError } from "./userController";
import Product from "../models/productModel";
import { fileSizeFormatter } from "../utils/uploadFiles";
import cloudinary from 'cloudinary';

export const createProduct = expressAsyncHandler(async (request: Request, response: Response) => {
    const { name, sku, category, quantity, price, description } = request.body;

    if(!name || !category || !quantity || !price || !description) {
        responseWithError(response, 400, 'Please fill in all fields');
    };

    // Handle image upload
    let fileData = {};
    if(request.file) {
        let uploadedFile;

        try {
            uploadedFile = await cloudinary.v2.uploader.upload(request.file.path, {folder: 'Pinvent App', resource_type: 'image'});
        } catch (error) {
            responseWithError(response, 500, 'Image could not be uploaded');
        };

        fileData = {
            fileName: request.file.originalname,
            filePath: uploadedFile?.secure_url,
            fileType: request.file.mimetype,
            fileSize: fileSizeFormatter(request.file.size, 2),
        };
    };

    const product = await Product.create({
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
});

export const getProducts = expressAsyncHandler(async (request: Request, response: Response) => {
    const products = await Product.find({ user: request.user.id }).sort('-createdAt');
    response.status(200).json(products);

});

export const getProduct = expressAsyncHandler(async (request: Request, response: Response) => {
    const product = await Product.findById(request.params.id);

    if(!product) {
        response.status(404);
        throw new Error('Product not found');
        //responseWithError(response, 404, 'Product not found');
    };

    if(product.user.toString() !== request.user.id) {
        responseWithError(response, 401, 'User not authorized');
    };

    response.status(200).json(product);
});

export const deleteProduct = expressAsyncHandler(async (request: Request, response: Response) => {
    const product = await Product.findById(request.params.id);

    if(!product) {
        response.status(404);
        throw new Error('Product not found');
        //responseWithError(response, 404, 'Product not found');
    };

    if(product.user.toString() !== request.user.id) {
        responseWithError(response, 401, 'User not authorized');
    };

    await product.deleteOne();

    response.status(200).json({ message: 'Product deleted succesfully' });
});

export const updateProduct = expressAsyncHandler(async (request: Request, response: Response) => {
    const { name, category, quantity, price, description } = request.body;
    const { id } = request.params;

    const product = await Product.findById(id);

    if(!product) {
        response.status(404);
        throw new Error('Product not found');
    };

    if(product.user.toString() !== request.user.id) {
        responseWithError(response, 401, 'User not authorized');
    };

    // Handle image upload
    let fileData = {};
    if(request.file) {
        let uploadedFile;

        try {
            uploadedFile = await cloudinary.v2.uploader.upload(request.file.path, {folder: 'Pinvent App', resource_type: 'image'});
        } catch (error) {
            responseWithError(response, 500, 'Image could not be uploaded');
        };

        fileData = {
            fileName: request.file.originalname,
            filePath: uploadedFile?.secure_url,
            fileType: request.file.mimetype,
            fileSize: fileSizeFormatter(request.file.size, 2),
        };
    };

    //Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    response.status(200).json(updatedProduct);
})