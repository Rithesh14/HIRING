import { create, findOne } from '../models/user';
import { sign } from 'jsonwebtoken';
import ApiError from '../utils/apiError';

// Register user
export async function register(req, res, next) {
  try {
    const { name, email, password, phone, experienceLevel, preferredRole } = req.body;
    const user = await create({ name, email, password, phone, experienceLevel, preferredRole });
    const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
}

// Login user
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid credentials');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');
    const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
}
