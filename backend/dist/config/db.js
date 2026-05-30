"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.isMongoConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.isMongoConnected = false;
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeforge';
    try {
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 3000 // Try for 3 seconds, then fail-over to JSON file
        });
        exports.isMongoConnected = true;
        console.log('MongoDB Connected successfully!');
    }
    catch (error) {
        console.warn(`MongoDB Connection failed: "${error.message}". Using local JSON file database fallback!`);
        exports.isMongoConnected = false;
    }
};
exports.connectDB = connectDB;
