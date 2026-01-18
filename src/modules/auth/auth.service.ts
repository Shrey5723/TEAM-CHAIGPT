import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../../config';
import { RegisterDto, LoginDto, JwtPayload } from '../../shared/types';
import { AppError } from '../../shared/utils';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

export class AuthService {
    // User Registration (APPLICANT or HIRER)
    async register(data: RegisterDto) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        // Validate role
        if (!Object.values(UserRole).includes(data.role)) {
            throw new AppError('Invalid role. Must be APPLICANT or HIRER', 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                dob: data.dob ? new Date(data.dob) : undefined,
                sector: data.sector,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                dob: true,
                sector: true,
                createdAt: true,
            },
        });

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return { user, token };
    }

    // User Login
    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                dob: user.dob,
                sector: user.sector,
            },
            token,
        };
    }

    // Get user profile
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                dob: true,
                sector: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    private generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as jwt.SignOptions);
    }
}

export const authService = new AuthService();
