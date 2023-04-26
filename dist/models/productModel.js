"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    sku: {
        type: String,
        required: true,
        default: "SKU",
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true,
    },
    quantity: {
        type: String,
        required: [true, 'Please add a quantity'],
        trim: true,
    },
    price: {
        type: String,
        required: [true, 'Please add a price'],
        trim: true,
    },
    description: {
        type: Object,
        required: [true, "Please add a description"],
        trim: true,
    },
    image: {
        type: Object,
        default: {},
    }
}, {
    timestamps: true,
});
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
