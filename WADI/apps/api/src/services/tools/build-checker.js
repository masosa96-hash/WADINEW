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
var child_process_1 = require("child_process");
var util_1 = require("util");
var logger_1 = require("../../core/logger");
var tool_registry_1 = require("../tool-registry");
var path = require("path");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Security safeguard: only run allowed commands
 */
var ALLOWED_COMMANDS = ["npm run build", "npm run lint", "npx tsc --noEmit", "npm install --no-save"];
var WORKSPACE_ROOT = path.resolve("e:\\WADINEW");
var PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, "projects");
function validateProjectPath(projectId) {
    var absolutePath = path.resolve(PROJECTS_ROOT, projectId);
    if (!absolutePath.startsWith(PROJECTS_ROOT)) {
        throw new Error("Access denied: Invalid project ID");
    }
    return absolutePath;
}
tool_registry_1.toolRegistry.registerTool({
    name: "validate_build",
    description: "Ejecuta un comando de validación y retorna un resultado clasificado (OK/WARN/ERROR/RISK).",
    parameters: {
        type: "object",
        properties: {
            projectId: { type: "string", description: "ID del proyecto" },
            command: {
                type: "string",
                enum: ALLOWED_COMMANDS,
                description: "El comando de validación a ejecutar"
            }
        },
        required: ["projectId", "command"]
    }
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var projectRoot, _c, stdout, stderr, error_1, stderr, stdout, isDependencyMissing, isTypeScriptError;
    var projectId = _b.projectId, command = _b.command;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                projectRoot = validateProjectPath(projectId);
                logger_1.logger.info({ msg: "executing_validation", projectId: projectId, command: command });
                return [4 /*yield*/, execAsync(command, { cwd: projectRoot })];
            case 1:
                _c = _d.sent(), stdout = _c.stdout, stderr = _c.stderr;
                return [2 /*return*/, {
                        status: "OK",
                        output: stdout
                    }];
            case 2:
                error_1 = _d.sent();
                stderr = error_1.stderr || error_1.message || "";
                stdout = error_1.stdout || "";
                isDependencyMissing = stderr.includes("Cannot find module") ||
                    stderr.includes("MODULE_NOT_FOUND") ||
                    stderr.includes("not found") ||
                    stderr.includes("not installed");
                isTypeScriptError = stderr.includes("error TS") ||
                    stdout.includes("error TS") ||
                    stderr.includes("TypeScript");
                if (isDependencyMissing && !isTypeScriptError) {
                    logger_1.logger.warn({ msg: "build_warn_dependencies", projectId: projectId });
                    return [2 /*return*/, {
                            status: "WARN",
                            reason: "dependencies_missing",
                            details: stderr,
                            output: stdout
                        }];
                }
                if (isTypeScriptError) {
                    logger_1.logger.warn({ msg: "build_error_typescript", projectId: projectId, details: stderr });
                    return [2 /*return*/, {
                            status: "ERROR",
                            reason: "typescript_errors",
                            details: stderr,
                            output: stdout
                        }];
                }
                // Default: generic risk
                logger_1.logger.warn({ msg: "build_risk_generic", projectId: projectId });
                return [2 /*return*/, {
                        status: "RISK",
                        reason: "tests_failed",
                        details: stderr,
                        output: stdout
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
