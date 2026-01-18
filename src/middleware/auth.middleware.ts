import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, AuthPayload } from '../shared/types';
import { AppError } from '../shared/utils';
import { UserRole } from '@prisma/client';

// Authenticate JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Invalid or expired token', 401));
        }
    }
};

// Authorize by roles
export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Not authorized to access this resource', 403));
        }

        next();
    };
};

// Applicant only middleware
export const applicantOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('Not authenticated', 401));
    }

    if (req.user.role !== UserRole.APPLICANT) {
        return next(new AppError('Only applicants can access this resource', 403));
    }

    next();
};

// Hirer only middleware
export const hirerOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('Not authenticated', 401));
    }

    if (req.user.role !== UserRole.HIRER) {
        return next(new AppError('Only hirers can access this resource', 403));
    }

    next();
};
