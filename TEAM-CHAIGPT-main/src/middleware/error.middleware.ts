import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../shared/utils';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.message);
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return sendError(res, 400, 'Database operation failed');
    }

    if (err.name === 'PrismaClientValidationError') {
        console.error('Prisma Validation Error:', err.message);
        return sendError(res, 400, process.env.NODE_ENV === 'development' ? err.message : 'Invalid data provided');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired');
    }

    // Default error
    return sendError(
        res,
        500,
        process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    );
};

export const notFoundHandler = (req: Request, res: Response) => {
    return sendError(res, 404, `Route ${req.originalUrl} not found`);
};
