"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Load configurations
dotenv_1.default.config();
const db_1 = require("./config/db");
const socketService_1 = require("./services/socketService");
const seeder_1 = require("./utils/seeder");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const problems_1 = __importDefault(require("./routes/problems"));
const contests_1 = __importDefault(require("./routes/contests"));
const discussions_1 = __importDefault(require("./routes/discussions"));
const ai_1 = __importDefault(require("./routes/ai"));
const portfolio_1 = __importDefault(require("./routes/portfolio"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// 1. WebSocket initialization
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for local portfolio run
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
(0, socketService_1.initSocketService)(io);
// 2. Global rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: { message: 'Too many requests from this IP. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
// Middleware
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use('/api/', limiter);
// Security logs middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    console.log(`[API REQUEST] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});
// Basic check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Connect Routes
app.use('/api/auth', auth_1.default);
app.use('/api/problems', problems_1.default);
app.use('/api/contests', contests_1.default);
app.use('/api/discussions', discussions_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/portfolio', portfolio_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// Startup Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    // Connect database
    await (0, db_1.connectDB)();
    // Run seeder
    await (0, seeder_1.seedDatabase)();
    server.listen(PORT, () => {
        console.log(`===============================================`);
        console.log(`CodeForge backend running on port http://localhost:${PORT}`);
        console.log(`WebSockets enabled and syncing clients...`);
        console.log(`===============================================`);
    });
};
startServer().catch(err => {
    console.error('Critical failure starting server:', err);
    process.exit(1);
});
