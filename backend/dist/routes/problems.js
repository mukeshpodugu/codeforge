"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const problemController_1 = require("../controllers/problemController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Problem listing and details (public or secured)
router.get('/', problemController_1.getProblems);
router.get('/:slug', problemController_1.getProblemDetail);
// Secured coding operations
router.post('/run', auth_1.authenticateToken, problemController_1.runCode);
router.post('/submit', auth_1.authenticateToken, problemController_1.submitCode);
router.get('/submissions/history', auth_1.authenticateToken, problemController_1.getSubmissions);
exports.default = router;
