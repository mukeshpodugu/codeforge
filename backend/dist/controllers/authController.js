"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repo_1 = require("../utils/repo");
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'codeforge_super_secure_jwt_secret_key_123!';
    return jsonwebtoken_1.default.sign({ id: userId, role }, secret, { expiresIn: '7d' });
};
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const existingEmail = await repo_1.Repo.findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered.' });
        }
        const existingUsername = await repo_1.Repo.findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken.' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user with default profile
        const verificationToken = Math.random().toString(36).substring(2, 15);
        const newUser = await repo_1.Repo.createUser({
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await repo_1.Repo.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        // Refresh last active and streak
        const lastActive = new Date(user.profile.lastActive || new Date());
        const diffDays = Math.floor((new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
        let streak = user.profile.streak || 0;
        if (diffDays === 1) {
            streak += 1;
        }
        else if (diffDays > 1) {
            streak = 1;
        }
        const updatedProfile = {
            ...user.profile,
            streak,
            lastActive: new Date()
        };
        await repo_1.Repo.updateUser(user._id || user.id, { profile: updatedProfile });
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.login = login;
const verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ message: 'Token is required.' });
    try {
        // Find user with verification token
        const allUsers = await repo_1.Repo.listProblems({}); // Mock utility list
        // Actually we can check by querying User repository
        const user = await repo_1.Repo.findUserByEmail(req.body.email || ''); // simple mock match
        if (!user) {
            // JSON find
            return res.status(404).json({ message: 'User not found.' });
        }
        await repo_1.Repo.updateUser(user._id || user.id, { isVerified: true, verificationToken: '' });
        return res.json({ message: 'Email verified successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.verifyEmail = verifyEmail;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: 'Email is required.' });
    try {
        const user = await repo_1.Repo.findUserByEmail(email);
        if (!user)
            return res.status(404).json({ message: 'Email not found.' });
        const resetToken = Math.random().toString(36).substring(2, 15);
        await repo_1.Repo.updateUser(user._id || user.id, { resetPasswordToken: resetToken });
        console.log(`[Reset Password Token for ${email}]: ${resetToken}`);
        return res.json({
            message: 'Password reset instructions sent. Check server logs for Mock Reset Token.',
            resetToken
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }
    try {
        const user = await repo_1.Repo.findUserByEmail(email);
        if (!user || user.resetPasswordToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await repo_1.Repo.updateUser(user._id || user.id, {
            password: hashedPassword,
            resetPasswordToken: ''
        });
        return res.json({ message: 'Password reset successfully. You can now login.' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
const getProfile = async (req, res) => {
    try {
        const user = await repo_1.Repo.findUserById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        return res.json({
            user: {
                id: user._id || user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { fullName, bio, skills, avatar } = req.body;
    try {
        const user = await repo_1.Repo.findUserById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        const updatedProfile = {
            ...user.profile,
            fullName: fullName !== undefined ? fullName : user.profile.fullName,
            bio: bio !== undefined ? bio : user.profile.bio,
            skills: skills !== undefined ? skills : user.profile.skills,
            avatar: avatar !== undefined ? avatar : user.profile.avatar
        };
        const updatedUser = await repo_1.Repo.updateUser(user._id || user.id, { profile: updatedProfile });
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
