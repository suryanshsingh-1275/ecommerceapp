import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

fs.mkdirSync('uploads', { recursive: true });

export default multer({
  storage: multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG or WEBP images allowed')),
});