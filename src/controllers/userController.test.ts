import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import { registerUser, token } from "./userController";

let req: Partial<Request>;
let res: Partial<Response>;
let next: Partial<NextFunction>;
let responseJson: string;
let responseStatus: number;

type ErrorType = {
    message: string,
    stack: string | null,
}

async function removeAllCollections () {
    const collections = Object.keys(mongoose.connection.collections)
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName]
      await collection.deleteMany()
    }
}

async function dropAllCollections () {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName]
        try {
            await collection.drop()
        } catch (error: any) {
        // This error happens when you try to drop a collection that's already dropped. Happens infrequently. 
        // Safe to ignore. 
        if (error.message === 'ns not found') return

        // This error happens when you use it.todo.
        // Safe to ignore. 
        if (error.message.includes('a background operation is currently running')) return

        console.log(error.message)
        }
    }
}

function expectStatus(status: number) {
    expect(responseStatus).toEqual(status);
}

function expectResponse(json: object | Array<object> | string) {
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
})
beforeAll(async() => {
    await mongoose.connect(`${process.env.MONGO_URI}`);
});
afterEach(async() => {
    await removeAllCollections();
})
afterAll(async () => {
    await dropAllCollections()
    // Closes the Mongoose connection
    await mongoose.connection.close()
});

describe('registerUser', () => {
    it.skip('works', async() => {
        const { length } = await User.find();
        req.body = {
            email: "testing@gmail.com",
            password: "Password123456",
            name: 'Jakub',
        }
        await registerUser(req as Request, res as Response, next as NextFunction);

        const users = await User.find();
        const user = await User.findOne({ email: 'testing@gmail.com' });

        expectStatus(201);
        expectResponse({
            _id: user?._id,
            name: "Jakub",
            email: "testing@gmail.com",
            phone: "+48",
            photo: "https://i.ibb.co/4pDNDk1/avatar.png",
            bio: "bio",
            token: token,
        })
        expect(users).toHaveLength(length + 1);
        expect(users[length]).toEqual(user);
    })
    it('handles missing body', async() => {
        await registerUser(req as Request, res as Response, next as NextFunction);

        expectStatus(400);
        expect(responseJson).toMatchObject<ErrorType>;
        expect(responseJson).toMatchSnapshot();

    });
    it('handles missing email in the body', async() => {
        req.body = {
            name: 'Test',
            password: "Test123456",
        };
        await registerUser(req as Request, res as Response, next as NextFunction);

        expectStatus(400);
        expect(responseJson).toMatchObject<ErrorType>;
        expect(responseJson).toMatchSnapshot();
    });
    it('handles an empty name (after trimming)', async() => {
        req.body = {name: '      '};
        await registerUser(req as Request, res as Response, next as NextFunction);

        expectStatus(400);
        expect(responseJson).toMatchObject<ErrorType>;
        expect(responseJson).toMatchSnapshot();
    });
    it('handles wrong length of password', async() => {
        req.body = { 
            name: 'Test',
            email: "Testing@gmail.com",
            password: "test",
        };
        await registerUser(req as Request, res as Response, next as NextFunction);

        expectStatus(400);
        expect(responseJson).toMatchObject<ErrorType>;
        expect(responseJson).toMatchSnapshot();
    });
});