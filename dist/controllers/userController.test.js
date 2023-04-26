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
const dotenv = __importStar(require("dotenv")); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const userController_1 = require("./userController");
let req;
let res;
let next;
let responseJson;
let responseStatus;
function removeAllCollections() {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = Object.keys(mongoose_1.default.connection.collections);
        for (const collectionName of collections) {
            const collection = mongoose_1.default.connection.collections[collectionName];
            yield collection.deleteMany();
        }
    });
}
function dropAllCollections() {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = Object.keys(mongoose_1.default.connection.collections);
        for (const collectionName of collections) {
            const collection = mongoose_1.default.connection.collections[collectionName];
            try {
                yield collection.drop();
            }
            catch (error) {
                // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
                // Safe to ignore. 
                if (error.message === 'ns not found')
                    return;
                // This error happens when you use it.todo.
                // Safe to ignore. 
                if (error.message.includes('a background operation is currently running'))
                    return;
                console.log(error.message);
            }
        }
    });
}
function expectStatus(status) {
    expect(responseStatus).toEqual(status);
}
function expectResponse(json) {
    expect(responseJson).toEqual(json);
}
beforeEach(() => {
    req = {
        params: {},
    };
    res = {
        json: jest.fn().mockImplementation((result) => {
            responseJson = result;
        }),
        status: jest.fn().mockImplementation((result) => {
            responseStatus = result;
        }),
    };
    next = jest.fn();
});
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(`${process.env.MONGO_URI}`);
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield removeAllCollections();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dropAllCollections();
    // Closes the Mongoose connection
    yield mongoose_1.default.connection.close();
}));
describe('registerUser', () => {
    it.skip('works', () => __awaiter(void 0, void 0, void 0, function* () {
        const { length } = yield userModel_1.default.find();
        req.body = {
            email: "testing@gmail.com",
            password: "Password123456",
            name: 'Jakub',
        };
        yield (0, userController_1.registerUser)(req, res, next);
        const users = yield userModel_1.default.find();
        const user = yield userModel_1.default.findOne({ email: 'testing@gmail.com' });
        expectStatus(201);
        expectResponse({
            _id: user === null || user === void 0 ? void 0 : user._id,
            name: "Jakub",
            email: "testing@gmail.com",
            phone: "+48",
            photo: "https://i.ibb.co/4pDNDk1/avatar.png",
            bio: "bio",
            token: userController_1.token,
        });
        expect(users).toHaveLength(length + 1);
        expect(users[length]).toEqual(user);
    }));
    it('handles missing body', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, userController_1.registerUser)(req, res, next);
        expectStatus(400);
        expect(responseJson).toMatchObject;
        expect(responseJson).toMatchSnapshot();
    }));
    it('handles missing email in the body', () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = {
            name: 'Test',
            password: "Test123456",
        };
        yield (0, userController_1.registerUser)(req, res, next);
        expectStatus(400);
        expect(responseJson).toMatchObject;
        expect(responseJson).toMatchSnapshot();
    }));
    it('handles an empty name (after trimming)', () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { name: '      ' };
        yield (0, userController_1.registerUser)(req, res, next);
        expectStatus(400);
        expect(responseJson).toMatchObject;
        expect(responseJson).toMatchSnapshot();
    }));
    it('handles wrong length of password', () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = {
            name: 'Test',
            email: "Testing@gmail.com",
            password: "test",
        };
        yield (0, userController_1.registerUser)(req, res, next);
        expectStatus(400);
        expect(responseJson).toMatchObject;
        expect(responseJson).toMatchSnapshot();
    }));
});
