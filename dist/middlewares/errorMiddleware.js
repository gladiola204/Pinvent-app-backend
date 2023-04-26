"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        messsage: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
}
;
exports.default = errorHandler;
