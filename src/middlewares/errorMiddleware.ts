import { ErrorRequestHandler, NextFunction, Request, Response } from "express";


function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    const statusCode = res.statusCode ? res.statusCode : 500;
    
    res.status(statusCode);
    res.json({
        messsage: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
};

export default errorHandler;