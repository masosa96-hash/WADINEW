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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelError = exports.RlsError = exports.AuthError = exports.RateLimitError = exports.AppError = void 0;
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(code, message, status) {
        if (status === void 0) { status = 500; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.status = status;
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError(message) {
        if (message === void 0) { message = "Too many requests"; }
        return _super.call(this, "RATE_LIMIT", message, 429) || this;
    }
    return RateLimitError;
}(AppError));
exports.RateLimitError = RateLimitError;
var AuthError = /** @class */ (function (_super) {
    __extends(AuthError, _super);
    function AuthError(message) {
        if (message === void 0) { message = "Authentication required"; }
        return _super.call(this, "AUTH_ERROR", message, 401) || this;
    }
    return AuthError;
}(AppError));
exports.AuthError = AuthError;
var RlsError = /** @class */ (function (_super) {
    __extends(RlsError, _super);
    function RlsError(message) {
        if (message === void 0) { message = "Access denied"; }
        return _super.call(this, "RLS_DENIED", message, 403) || this;
    }
    return RlsError;
}(AppError));
exports.RlsError = RlsError;
var ModelError = /** @class */ (function (_super) {
    __extends(ModelError, _super);
    function ModelError(message) {
        if (message === void 0) { message = "AI Model Error"; }
        return _super.call(this, "MODEL_ERROR", message, 502) || this;
    }
    return ModelError;
}(AppError));
exports.ModelError = ModelError;
