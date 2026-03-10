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
var tool_registry_1 = require("../tool-registry");
var template_service_1 = require("../templates/template-service");
var logger_1 = require("../../core/logger");
tool_registry_1.toolRegistry.registerTool({
    name: "initialize_scaffolding",
    description: "Inicializa un proyecto con un esqueleto base (Next.js, Vite, Node).",
    parameters: {
        type: "object",
        properties: {
            projectId: { type: "string", description: "ID del proyecto" },
            templateId: {
                type: "string",
                enum: ["nextjs-tailwind", "vite-react-ts"],
                description: "ID del template base a usar"
            }
        },
        required: ["projectId", "templateId"]
    }
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var template, _i, _c, file, error_1;
    var projectId = _b.projectId, templateId = _b.templateId;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 5, , 6]);
                template = template_service_1.templateService.getTemplate(templateId);
                if (!template) {
                    throw new Error("Template ".concat(templateId, " not found"));
                }
                logger_1.logger.info({ msg: "scaffolding_init", projectId: projectId, template: templateId });
                _i = 0, _c = template.baseFiles;
                _d.label = 1;
            case 1:
                if (!(_i < _c.length)) return [3 /*break*/, 4];
                file = _c[_i];
                return [4 /*yield*/, tool_registry_1.toolRegistry.callTool("write_file", {
                        path: "".concat(projectId, "/").concat(file.path),
                        content: file.content
                    })];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, { success: true, filesCreated: template.baseFiles.length }];
            case 5:
                error_1 = _d.sent();
                logger_1.logger.error({ msg: "scaffolding_failed", projectId: projectId, error: error_1.message });
                throw error_1;
            case 6: return [2 /*return*/];
        }
    });
}); });
