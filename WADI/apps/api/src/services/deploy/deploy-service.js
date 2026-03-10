"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployService = void 0;
var logger_1 = require("../../core/logger");
var execution_policy_1 = require("../../core/execution-policy");
var DeployService = /** @class */ (function () {
    function DeployService() {
    }
    /**
     * Deploys a materialized project to a cloud provider.
     * Always checks ExecutionPolicy before executing.
     */
    DeployService.prototype.deploy = function (projectId_1) {
        return __awaiter(this, arguments, void 0, function (projectId, provider) {
            var url;
            if (provider === void 0) { provider = "render"; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Policy gate — must pass before any cloud call
                        if (!(0, execution_policy_1.isDeployAllowed)(provider)) {
                            logger_1.logger.warn({ msg: "deploy_blocked_by_policy", projectId: projectId, provider: provider, enableAutoDeploy: execution_policy_1.ExecutionPolicy.enableAutoDeploy });
                            return [2 /*return*/, {
                                    success: false,
                                    provider: provider,
                                    error: "Deploy disabled by ExecutionPolicy. Set ENABLE_AUTODEPLOY=true to enable."
                                }];
                        }
                        logger_1.logger.info({ msg: "deploy_start", projectId: projectId, provider: provider });
                        // Simulate network delay (replace with real API call)
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 1:
                        // Simulate network delay (replace with real API call)
                        _a.sent();
                        url = "https://".concat(projectId, ".").concat(provider, ".app");
                        logger_1.logger.info({ msg: "deploy_success", projectId: projectId, url: url });
                        return [2 /*return*/, {
                                success: true,
                                url: url,
                                provider: provider
                            }];
                }
            });
        });
    };
    return DeployService;
}());
exports.deployService = new DeployService();
