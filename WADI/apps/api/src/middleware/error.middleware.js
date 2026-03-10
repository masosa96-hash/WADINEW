"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
var logger_1 = require("../core/logger");
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(code, message, statusCode, meta) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.meta = meta;
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
var errorHandler = function (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    var _a;
    var isProduction = process.env.NODE_ENV === "production";
    var statusCode = err.statusCode || err.status || 500;
    var requestId = req.requestId;
    // Structured logging with Pino
    logger_1.logger.error({
        msg: "uncaught_exception",
        error: {
            message: err.message,
            code: err.code || "INTERNAL_ERROR",
            stack: isProduction ? undefined : err.stack,
            meta: err.meta,
        },
        context: {
            path: req.path,
            method: req.method,
            requestId: requestId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        }
    });
    return res.status(statusCode).json({
        status: "error",
        requestId: requestId,
        error: __assign({ message: isProduction && statusCode === 500 ? "Service Unavailable" : err.message, code: err.code || "INTERNAL_SERVER_ERROR" }, (isProduction ? {} : { stack: err.stack, meta: err.meta })),
    });
};
exports.errorHandler = errorHandler;
