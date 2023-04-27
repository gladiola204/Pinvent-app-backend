"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv = __importStar(require("dotenv")); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const productRoute_1 = require("./routes/productRoute");
const path_1 = __importDefault(require("path"));
const contactRoute_1 = require("./routes/contactRoute");
exports.app = (0, express_1.default)();
// Middlewares
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://pinvent-app-pink.vercel.app"],
    credentials: true,
}));
exports.app.use(express_1.default.json());
//app.use(bodyParser.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, 'src', "uploads")));
exports.app.set('x-powered-by', false);
// Routes Middlewares
exports.app.use('/api/users', userRoute_1.default);
exports.app.use('/api/products', productRoute_1.productRouter);
exports.app.use('/api/contact', contactRoute_1.contactRouter);
// Routes
exports.app.get("/", (req, res) => {
    res.send("Home page");
});
exports.app.get('*', (req, res) => {
    res.status(404).send('Not found');
});
// Error middleware
exports.app.use(errorMiddleware_1.default);
