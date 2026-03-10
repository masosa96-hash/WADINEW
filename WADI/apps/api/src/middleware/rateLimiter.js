"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRateLimiter = exports.incrementGlobalBudget = exports.globalBudgetGuard = exports.expensiveRateLimiter = exports.rateLimiter = void 0;
var express_rate_limit_1 = require("express-rate-limit");
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
});
exports.expensiveRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "AI limits exceeded for this hour. Please wait." },
});
// --- Budget Guard (Global Daily Cap) ---
// Note: In a production environment with multiple instances, this would use Redis.
// For the 14-day soft launch, a memory-based guard is sufficient for a single instance.
var dailyGlobalCount = 0;
var lastReset = Date.now();
var GLOBAL_DAILY_LIMIT = 200;
var globalBudgetGuard = function (req, res, next) {
    var now = Date.now();
    // Reset at midnight or every 24h
    if (now - lastReset > 24 * 60 * 60 * 1000) {
        dailyGlobalCount = 0;
        lastReset = now;
    }
    if (dailyGlobalCount >= GLOBAL_DAILY_LIMIT) {
        return res.status(503).json({
            error: "Global daily budget reached. AI features are temporarily paused for safety."
        });
    }
    // Increment is handled in the controller after a successful start, 
    // or here if we want to be conservative (pre-decrement).
    next();
};
exports.globalBudgetGuard = globalBudgetGuard;
var incrementGlobalBudget = function () {
    dailyGlobalCount++;
};
exports.incrementGlobalBudget = incrementGlobalBudget;
exports.adminRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Admin rate limit exceeded" },
});
