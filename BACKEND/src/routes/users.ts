import express from 'express';
import { body } from 'express-validator';
import { 
  getProfile, 
  updateProfile, 
  changePassword,
  uploadAvatar,
  deleteAccount
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Profile validation
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('experienceLevel')
    .optional()
    .isIn(['fresher', '1-3', '3+'])
    .withMessage('Experience level must be fresher, 1-3, or 3+'),
  body('preferredRole')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Preferred role must be less than 100 characters')
];

// Password change validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', updateProfileValidation, validate, asyncHandler(updateProfile));
router.post('/change-password', changePasswordValidation, validate, asyncHandler(changePassword));
router.post('/avatar', upload.single('avatar'), asyncHandler(uploadAvatar));
router.delete('/account', asyncHandler(deleteAccount));

export default router;