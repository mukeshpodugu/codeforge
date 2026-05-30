"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repo_1 = require("../utils/repo");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required.' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'codeforge_super_secure_jwt_secret_key_123!';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await repo_1.Repo.findUserById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'User session not found.' });
        }
        req.user = {
            id: user._id || user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
