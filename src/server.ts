import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRouter from './routes/userRoute';
import errorHandler from './middlewares/errorMiddleware';
import cookieParser from 'cookie-parser';
import { productRouter } from './routes/productRoute';
import path from 'path';
import { contactRouter } from './routes/contactRoute';

export const app = express();

// Middlewares
app.use(cors({
    origin: ["http://localhost:3000", "https://pinvent-app-pink.vercel.app", "http://pinvent-app-pink.vercel.app"],
    credentials: true,
    allowedHeaders: ["Access-Control-Allow-Credentials"]
}));
app.use(express.json());
//app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, 'src',"uploads")));

app.set('x-powered-by', false);


// Routes Middlewares
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/contact', contactRouter);


// Routes
app.get("/", (req: Request, res: Response) => {
    res.send("Home page");
})

app.get('*', (req: Request, res: Response) => {
    res.status(404).send('Not found');
});

// Error middleware
app.use(errorHandler);