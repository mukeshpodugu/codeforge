"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDb = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(__dirname, '../../db.json');
const defaultState = {
    users: [],
    problems: [],
    submissions: [],
    contests: [],
    discussions: [],
    collaborations: [],
    notifications: [],
    interviewRecords: [],
};
// Initialize DB file if not exists
if (!fs_1.default.existsSync(DB_FILE)) {
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
}
class JsonDb {
    static readData() {
        try {
            if (!fs_1.default.existsSync(DB_FILE)) {
                fs_1.default.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
                return defaultState;
            }
            const raw = fs_1.default.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(raw);
        }
        catch (e) {
            console.error('Error reading JSON fallback DB:', e);
            return defaultState;
        }
    }
    static writeData(data) {
        try {
            fs_1.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        }
        catch (e) {
            console.error('Error writing JSON fallback DB:', e);
        }
    }
    static getCollection(key) {
        const data = this.readData();
        return data[key] || [];
    }
    static setCollection(key, collection) {
        const data = this.readData();
        data[key] = collection;
        this.writeData(data);
    }
    static find(collectionName, predicate = () => true) {
        const col = this.getCollection(collectionName);
        return col.filter(predicate);
    }
    static findOne(collectionName, predicate) {
        const col = this.getCollection(collectionName);
        const item = col.find(predicate);
        return item || null;
    }
    static create(collectionName, item) {
        const col = this.getCollection(collectionName);
        const newId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const newItem = {
            _id: newId,
            id: newId,
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        col.push(newItem);
        this.setCollection(collectionName, col);
        return newItem;
    }
    static update(collectionName, id, updates) {
        const col = this.getCollection(collectionName);
        const index = col.findIndex((item) => item._id === id || item.id === id);
        if (index === -1)
            return null;
        const updatedItem = {
            ...col[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        col[index] = updatedItem;
        this.setCollection(collectionName, col);
        return updatedItem;
    }
    static delete(collectionName, id) {
        const col = this.getCollection(collectionName);
        const filtered = col.filter((item) => item._id !== id && item.id !== id);
        if (filtered.length === col.length)
            return false;
        this.setCollection(collectionName, filtered);
        return true;
    }
}
exports.JsonDb = JsonDb;
