import multer from 'multer';
import path from 'path';
import { AppError } from '../shared/utils';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// PDF only filter for resumes
const pdfFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for resumes'));
    }
};

// PDF and image filter for certificates
const certificateFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and image files are allowed for certificates'));
    }
};

// Resume upload (PDF only, max 10MB)
export const uploadResume = multer({
    storage,
    fileFilter: pdfFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Certificate upload (PDF/images, max 5MB each)
export const uploadCertificate = multer({
    storage,
    fileFilter: certificateFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
