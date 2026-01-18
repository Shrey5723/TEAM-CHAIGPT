import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data: T,
    message?: string
): Response => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    } as ApiResponse<T>);
};

export const sendError = (
    res: Response,
    statusCode: number,
    error: string
): Response => {
    return res.status(statusCode).json({
        success: false,
        error,
    } as ApiResponse);
};
