import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { auditLog } from '../services/auditService';

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      experienceLevel: true,
      preferredRole: true,
      avatar: true,
      isEmailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, phone, experienceLevel, preferredRole } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(experienceLevel && { experienceLevel }),
      ...(preferredRole && { preferredRole })
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      experienceLevel: true,
      preferredRole: true,
      avatar: true,
      updatedAt: true
    }
  });

  // Log audit
  await auditLog({
    userId,
    action: 'PROFILE_UPDATED',
    resource: 'USER',
    details: { updatedFields: Object.keys(req.body) },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`Profile updated for user: ${updatedUser.email}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, password: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  // Log audit
  await auditLog({
    userId,
    action: 'PASSWORD_CHANGED',
    resource: 'USER',
    details: { email: user.email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  // In a real application, you would upload to AWS S3 or similar service
  // For now, we'll just store the filename
  const avatarUrl = `/uploads/avatars/${file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true
    }
  });

  // Log audit
  await auditLog({
    userId,
    action: 'AVATAR_UPLOADED',
    resource: 'USER',
    details: { avatarUrl },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { user: updatedUser }
  });
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Get user info for logging
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Delete user and all related data (cascading deletes handled by Prisma)
  await prisma.user.delete({
    where: { id: userId }
  });

  // Log audit (this will be the last log for this user)
  await auditLog({
    userId,
    action: 'ACCOUNT_DELETED',
    resource: 'USER',
    details: { email: user.email },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info(`Account deleted for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
};