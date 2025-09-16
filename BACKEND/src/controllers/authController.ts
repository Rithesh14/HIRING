import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/emailService';
import { auditLog } from '../services/auditService';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role = 'CANDIDATE', experienceLevel, preferredRole, phone } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  // Generate email verification token
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      experienceLevel,
      preferredRole,
      phone,
      emailVerifyToken
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      experienceLevel: true,
      preferredRole: true,
      isEmailVerified: true,
      createdAt: true
    }
  });

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - TechHire Analytics',
      template: 'emailVerification',
      data: {
        name,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${emailVerifyToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  // Log audit
  await auditLog({
    userId: user.id,
    action: 'USER_REGISTERED',
    resource: 'USER',
    details: { email, role },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: { user }
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      experienceLevel: true,
      preferredRole: true,
      isEmailVerified: true,
      lastLogin: true
    }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // Store refresh token in Redis
  await cache.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

  // Log audit
  await auditLog({
    userId: user.id,
    action: 'USER_LOGIN',
    resource: 'USER',
    details: { email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`User logged in: ${email}`);

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }
  });
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Check if refresh token exists in Redis
    const storedToken = await cache.get(`refresh_token:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    // Update refresh token in Redis
    await cache.set(`refresh_token:${decoded.id}`, newRefreshToken, 30 * 24 * 60 * 60);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    }
  });

  // Send reset email
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset - TechHire Analytics',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw new AppError('Failed to send password reset email', 500);
  }

  // Log audit
  await auditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    resource: 'USER',
    details: { email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.'
  });
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  // Invalidate all refresh tokens
  await cache.del(`refresh_token:${user.id}`);

  // Log audit
  await auditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    resource: 'USER',
    details: { email: user.email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`Password reset completed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.'
  });
};

export const verifyEmail = async (req: AuthRequest, res: Response) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token }
  });

  if (!user) {
    throw new AppError('Invalid verification token', 400);
  }

  // Update user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null
    }
  });

  // Log audit
  await auditLog({
    userId: user.id,
    action: 'EMAIL_VERIFIED',
    resource: 'USER',
    details: { email: user.email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`Email verified for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Email verified successfully. You can now log in.'
  });
};

export const resendVerification = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerifyToken }
  });

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - TechHire Analytics',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${emailVerifyToken}`
      }
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw new AppError('Failed to send verification email', 500);
  }

  res.json({
    success: true,
    message: 'Verification email sent successfully.'
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Remove refresh token from Redis
  await cache.del(`refresh_token:${userId}`);

  // Log audit
  await auditLog({
    userId,
    action: 'USER_LOGOUT',
    resource: 'USER',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};