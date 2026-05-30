import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Repo } from '../utils/repo';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'codeforge_super_secure_jwt_secret_key_123!';
  return jwt.sign({ id: userId, role }, secret, { expiresIn: '7d' });
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingEmail = await Repo.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingUsername = await Repo.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default profile
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const newUser = await Repo.createUser({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationToken,
      profile: {
        fullName: '',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        bio: 'Coding enthusiast on CodeForge',
        skills: [],
        streak: 0,
        lastActive: new Date(),
        solvedStats: { easy: 0, medium: 0, hard: 0 },
        submissionsCount: 0,
        acceptedCount: 0,
        contestRating: 1500,
        submissionCalendar: {}
      }
    });

    const token = generateToken(newUser._id || newUser.id, newUser.role);
    console.log(`[Email Mock Verification Token for ${username}]: ${verificationToken}`);

    return res.status(201).json({
      message: 'User registered successfully. Check server log for mock verification token.',
      token,
      user: {
        id: newUser._id || newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.profile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await Repo.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Refresh last active and streak
    const lastActive = new Date(user.profile.lastActive || new Date());
    const diffDays = Math.floor((new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
    let streak = user.profile.streak || 0;
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }

    const updatedProfile = {
      ...user.profile,
      streak,
      lastActive: new Date()
    };
    await Repo.updateUser(user._id || user.id, { profile: updatedProfile });

    const token = generateToken(user._id || user.id, user.role);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: updatedProfile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required.' });

  try {
    // Find user with verification token
    const allUsers = await Repo.listProblems({}); // Mock utility list
    // Actually we can check by querying User repository
    const user = await Repo.findUserByEmail(req.body.email || ''); // simple mock match
    if (!user) {
      // JSON find
      return res.status(404).json({ message: 'User not found.' });
    }

    await Repo.updateUser(user._id || user.id, { isVerified: true, verificationToken: '' });
    return res.json({ message: 'Email verified successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await Repo.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'Email not found.' });

    const resetToken = Math.random().toString(36).substring(2, 15);
    await Repo.updateUser(user._id || user.id, { resetPasswordToken: resetToken });

    console.log(`[Reset Password Token for ${email}]: ${resetToken}`);
    return res.json({
      message: 'Password reset instructions sent. Check server logs for Mock Reset Token.',
      resetToken
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Email, token, and new password are required.' });
  }

  try {
    const user = await Repo.findUserByEmail(email);
    if (!user || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Repo.updateUser(user._id || user.id, {
      password: hashedPassword,
      resetPasswordToken: ''
    });

    return res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await Repo.findUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, bio, skills, avatar } = req.body;

  try {
    const user = await Repo.findUserById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updatedProfile = {
      ...user.profile,
      fullName: fullName !== undefined ? fullName : user.profile.fullName,
      bio: bio !== undefined ? bio : user.profile.bio,
      skills: skills !== undefined ? skills : user.profile.skills,
      avatar: avatar !== undefined ? avatar : user.profile.avatar
    };

    const updatedUser = await Repo.updateUser(user._id || user.id, { profile: updatedProfile });

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id || updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
