"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const router = (0, express_1.Router)();
router.get('/info', portfolioController_1.getDeveloperInfo);
router.post('/contact', portfolioController_1.submitContactForm);
exports.default = router;
