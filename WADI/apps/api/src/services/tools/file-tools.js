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
exports.validatePath = validatePath;
var fs = require("fs/promises");
var path = require("path");
var logger_1 = require("../../core/logger");
var tool_registry_1 = require("../tool-registry");
/**
 * Security safeguard: ensure paths are within the workspace
 */
var WORKSPACE_ROOT = path.resolve("e:\\WADINEW");
var PROJECTS_ROOT = path.resolve(WORKSPACE_ROOT, "projects");
function validatePath(targetPath) {
    // 1. Security check: No null bytes or suspicious characters
    if (targetPath.includes('\0') || targetPath.includes('..')) {
        logger_1.logger.error({ msg: "security_violation_invalid_characters", path: targetPath });
        throw new Error("Access denied: invalid characters in path ".concat(targetPath));
    }
    // 2. Normalize and resolve to absolute
    var absolutePath = path.resolve(PROJECTS_ROOT, targetPath);
    // 3. Security check: Must be inside PROJECTS_ROOT and NOT WORKSPACE_ROOT (api itself)
    if (!absolutePath.startsWith(PROJECTS_ROOT)) {
        logger_1.logger.error({ msg: "security_violation_path_traversal", path: targetPath, resolved: absolutePath });
        throw new Error("Access denied: path ".concat(targetPath, " is outside the allowed projects directory."));
    }
    return absolutePath;
}
// ─── CodeWriter Tools Registration ───────────────────────────────────────────
tool_registry_1.toolRegistry.registerTool({
    name: "write_file",
    description: "Escribe contenido en un archivo. Úsalo para generar código o configuraciones.",
    parameters: {
        type: "object",
        properties: {
            path: { type: "string", description: "Ruta relativa dentro del proyecto" },
            content: { type: "string", description: "Contenido completo del archivo" }
        },
        required: ["path", "content"]
    }
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fullPath, error_1;
    var relPath = _b.path, content = _b.content;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                fullPath = validatePath(relPath);
                return [4 /*yield*/, fs.mkdir(path.dirname(fullPath), { recursive: true })];
            case 1:
                _c.sent();
                return [4 /*yield*/, fs.writeFile(fullPath, content, "utf-8")];
            case 2:
                _c.sent();
                logger_1.logger.info({ msg: "file_written", path: relPath });
                return [2 /*return*/, { success: true, path: relPath }];
            case 3:
                error_1 = _c.sent();
                logger_1.logger.error({ msg: "write_file_failed", path: relPath, error: error_1.message });
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); });
tool_registry_1.toolRegistry.registerTool({
    name: "create_directory",
    description: "Crea un directorio de forma recursiva.",
    parameters: {
        type: "object",
        properties: {
            path: { type: "string", description: "Ruta relativa del directorio" }
        },
        required: ["path"]
    }
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fullPath, error_2;
    var relPath = _b.path;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                fullPath = validatePath(relPath);
                return [4 /*yield*/, fs.mkdir(fullPath, { recursive: true })];
            case 1:
                _c.sent();
                logger_1.logger.info({ msg: "directory_created", path: relPath });
                return [2 /*return*/, { success: true, path: relPath }];
            case 2:
                error_2 = _c.sent();
                logger_1.logger.error({ msg: "create_directory_failed", path: relPath, error: error_2.message });
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); });
tool_registry_1.toolRegistry.registerTool({
    name: "list_project_files",
    description: "Lista archivos en el directorio del proyecto para entender la estructura actual.",
    parameters: {
        type: "object",
        properties: {
            path: { type: "string", description: "Ruta relativa a listar (opcional)", default: "." }
        }
    }
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fullPath, files, error_3;
    var _c = _b.path, relPath = _c === void 0 ? "." : _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                fullPath = validatePath(relPath);
                return [4 /*yield*/, fs.readdir(fullPath, { withFileTypes: true })];
            case 1:
                files = _d.sent();
                return [2 /*return*/, {
                        path: relPath,
                        items: files.map(function (f) { return ({
                            name: f.name,
                            type: f.isDirectory() ? "directory" : "file"
                        }); })
                    }];
            case 2:
                error_3 = _d.sent();
                logger_1.logger.error({ msg: "list_files_failed", path: relPath, error: error_3.message });
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); });
