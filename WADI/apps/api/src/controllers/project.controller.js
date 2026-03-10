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
exports.generatePRD = exports.bulkDeleteProjects = exports.updateProjectStructure = exports.crystallizeProject = exports.getProject = exports.listProjects = void 0;
exports.generateProjectName = generateProjectName;
var supabase_1 = require("../supabase");
var error_middleware_1 = require("../middleware/error.middleware");
var wadi_brain_1 = require("../wadi-brain");
var cognitive_service_1 = require("../services/cognitive-service");
var rateLimiter_1 = require("../middleware/rateLimiter");
var zod_1 = require("zod");
// Helper: Generate Technical Project Name
function generateProjectName(description) {
    var cleanDesc = description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
    var words = cleanDesc.split(/\s+/).slice(0, 3);
    var name = words.join("-") || "untitled-project";
    return "".concat(name, "-").concat(Date.now().toString().slice(-4));
}
var listProjects = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.user.id;
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .select("*")
                        .eq("user_id", userId)
                        .order("updated_at", { ascending: false })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    throw new error_middleware_1.AppError("DB_ERROR", error.message);
                res.json(data);
                return [2 /*return*/];
        }
    });
}); };
exports.listProjects = listProjects;
var getProject = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                userId = req.user.id;
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .select("*")
                        .eq("id", id)
                        .eq("user_id", userId)
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    if (error.code === "PGRST116") {
                        throw new error_middleware_1.AppError("NOT_FOUND", "Proyecto no encontrado");
                    }
                    throw new error_middleware_1.AppError("DB_ERROR", error.message);
                }
                res.json(data);
                return [2 /*return*/];
        }
    });
}); };
exports.getProject = getProject;
var CrystallizeSchema = zod_1.z.object({
    name: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().max(5000).min(10),
    suggestionContent: zod_1.z.any().optional(),
    firstMessageAt: zod_1.z.string().datetime().optional(),
}).strict(); // Reject unknown fields to prevent metadata manipulation
var crystallizeProject = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, validated, _a, name, description, suggestionContent, firstMessageAt, parsed, descPart, _b, projectRaw, insertError, inputLength, project;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                userId = req.user.id;
                // 1. Initial length guard
                if (((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.description) === null || _d === void 0 ? void 0 : _d.length) > 5000) {
                    return [2 /*return*/, res.status(400).json({ error: "Description is too large (max 5000 chars)" })];
                }
                validated = CrystallizeSchema.safeParse(req.body);
                if (!validated.success) {
                    return [2 /*return*/, res.status(400).json({ error: "Invalid input", details: validated.error.format() })];
                }
                _a = validated.data, name = _a.name, description = _a.description, suggestionContent = _a.suggestionContent, firstMessageAt = _a.firstMessageAt;
                // Support legacy suggestionContent JSON (sanitized)
                if (!name && suggestionContent) {
                    try {
                        parsed = typeof suggestionContent === "string"
                            ? JSON.parse(suggestionContent)
                            : suggestionContent;
                        name = String(parsed.name || "").slice(0, 100) || "Idea Sin Nombre";
                        descPart = String(parsed.content || parsed.description || "").slice(0, 5000);
                        if (descPart)
                            description = descPart;
                    }
                    catch (_f) {
                        name = "Idea Sin Nombre";
                    }
                }
                if (!name) {
                    name = generateProjectName(description);
                }
                // Double check description after legacy parsing
                if (description.length > 5000)
                    description = description.slice(0, 5000);
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .insert([{
                            user_id: userId,
                            name: name,
                            description: description,
                            status: "GENERATING_STRUCTURE",
                            first_message_at: firstMessageAt || null,
                        }])
                        .select()
                        .single()];
            case 1:
                _b = _e.sent(), projectRaw = _b.data, insertError = _b.error;
                if (insertError)
                    throw new error_middleware_1.AppError("DB_ERROR", insertError.message);
                // Track global budget usage
                (0, rateLimiter_1.incrementGlobalBudget)();
                inputLength = description.length;
                project = projectRaw;
                // Respond immediately — frontend starts polling
                res.status(201).json({ project: project });
                // Step 2: Async job — generate structure without blocking response
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var startedAt, existing, existingNames, cognitiveSummary, userProfile, currentProfileVersion, structure, duration, ttv_ms, err_1, duration;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                startedAt = Date.now();
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 7, , 9]);
                                console.log("[DASHBOARD_SIGNAL] event=CRYSTALLIZE_START user_id=".concat(userId, " project_id=").concat(project.id, " input_length=").concat(inputLength));
                                return [4 /*yield*/, supabase_1.supabase
                                        .from("projects")
                                        .select("name")
                                        .eq("user_id", userId)
                                        .neq("id", project.id)];
                            case 2:
                                existing = (_b.sent()).data;
                                existingNames = (existing || []).map(function (p) { return p.name; });
                                return [4 /*yield*/, (0, cognitive_service_1.getCognitiveProfileSummary)(userId)];
                            case 3:
                                cognitiveSummary = _b.sent();
                                return [4 /*yield*/, supabase_1.supabase
                                        .from("user_cognitive_profile_current")
                                        .select("profile_version")
                                        .eq("user_id", userId)
                                        .single()];
                            case 4:
                                userProfile = (_b.sent()).data;
                                currentProfileVersion = (_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.profile_version) !== null && _a !== void 0 ? _a : 1;
                                return [4 /*yield*/, (0, wadi_brain_1.generateCrystallizeStructure)(name, description, existingNames, cognitiveSummary)];
                            case 5:
                                structure = _b.sent();
                                duration = Date.now() - startedAt;
                                ttv_ms = firstMessageAt ? Date.now() - new Date(firstMessageAt).getTime() : null;
                                return [4 /*yield*/, supabase_1.supabase
                                        .from("projects")
                                        .update({
                                        structure: structure,
                                        structure_version: 1,
                                        profile_version: currentProfileVersion,
                                        prompt_version: wadi_brain_1.CRYSTALLIZE_PROMPT_VERSION,
                                        ttv_ms: ttv_ms,
                                        status: "READY",
                                        updated_at: new Date().toISOString(),
                                    })
                                        .eq("id", project.id)
                                        .eq("user_id", userId)];
                            case 6:
                                _b.sent(); // Critical: Security check even in async update
                                console.log("[DASHBOARD_SIGNAL] event=CRYSTALLIZE_READY user_id=".concat(userId, " project_id=").concat(project.id, " job_duration=").concat(duration, "ms ttv_ms=").concat(ttv_ms));
                                console.log("[CRYSTALLIZE] Project ".concat(project.id, " \u2014 OK \u2014 ").concat(duration, "ms"));
                                return [3 /*break*/, 9];
                            case 7:
                                err_1 = _b.sent();
                                duration = Date.now() - startedAt;
                                console.error("[CRYSTALLIZE] Project ".concat(project.id, " \u2014 FAILED \u2014 ").concat(duration, "ms \u2014"), err_1.message);
                                return [4 /*yield*/, supabase_1.supabase
                                        .from("projects")
                                        .update({ status: "STRUCTURE_FAILED", updated_at: new Date().toISOString() })
                                        .eq("id", project.id)
                                        .eq("user_id", userId)];
                            case 8:
                                _b.sent();
                                return [3 /*break*/, 9];
                            case 9: return [2 /*return*/];
                        }
                    });
                }); })();
                return [2 /*return*/];
        }
    });
}); };
exports.crystallizeProject = crystallizeProject;
// ─── Zod Schemas ───────────────────────────────────────────────────────────
var ProjectStructureSchema = zod_1.z.object({
    problem: zod_1.z.string().min(3).max(2000),
    solution: zod_1.z.string().min(3).max(2000),
    target_icp: zod_1.z.string().min(3).max(1000),
    value_proposition: zod_1.z.string().min(3).max(1000),
    recommended_stack: zod_1.z.string().min(3).max(1000),
    milestones: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(30),
    risks: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(20),
    validation_steps: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(20),
    terminal_commands: zod_1.z.array(zod_1.z.string()).optional(),
    orientation: zod_1.z.enum(["technical", "business"]).optional(),
    templateId: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        params: zod_1.z.record(zod_1.z.string()).optional()
    })).optional(),
    shouldDeploy: zod_1.z.boolean().optional(),
    deployProvider: zod_1.z.enum(["render", "vercel"]).optional(),
}).strict(); // Security: Prevent extra top-level keys like { "admin": true }
var updateProjectStructure = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, structure, validated, _a, current, fetchError, nextVersion, updatePayload, _b, data, error;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                id = req.params.id;
                userId = req.user.id;
                structure = req.body.structure;
                validated = ProjectStructureSchema.safeParse(structure);
                if (!validated.success) {
                    return [2 /*return*/, res.status(400).json({ error: "Invalid structure data", details: validated.error.format() })];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .select("*")
                        .eq("id", id)
                        .eq("user_id", userId)
                        .single()];
            case 1:
                _a = _d.sent(), current = _a.data, fetchError = _a.error;
                if (fetchError || !current)
                    throw new error_middleware_1.AppError("NOT_FOUND", "Proyecto no encontrado o acceso denegado");
                // Concurrency Lock: Prevent editing while generating
                if (current.status === "GENERATING_STRUCTURE") {
                    return [2 /*return*/, res.status(409).json({ error: "No se puede editar mientras se genera la estructura" })];
                }
                // Verify ownership again explicitly just in case PGRST116 is handled differently
                if (current.user_id !== userId)
                    throw new error_middleware_1.AppError("NOT_AUTHORIZED", "No tenés permiso para editar este proyecto");
                nextVersion = ((_c = current === null || current === void 0 ? void 0 : current.structure_version) !== null && _c !== void 0 ? _c : 1) + 1;
                updatePayload = {
                    structure: validated.data,
                    structure_version: nextVersion,
                    updated_at: new Date().toISOString(),
                };
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .update(updatePayload)
                        .eq("id", id)
                        .eq("user_id", userId)
                        .select()
                        .single()];
            case 2:
                _b = _d.sent(), data = _b.data, error = _b.error;
                if (error)
                    throw new error_middleware_1.AppError("DB_ERROR", error.message);
                console.log("[STRUCTURE EDIT] Project ".concat(id, " \u2014 version ").concat(nextVersion));
                res.json({ project: data });
                // Post-update analysis (fire & forget)
                (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var oldStructure, newStructure, fieldsToCheck, _i, fieldsToCheck_1, field, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 6, , 7]);
                                oldStructure = (current.structure || {});
                                newStructure = validated.data;
                                fieldsToCheck = ["problem", "solution", "target_icp", "value_proposition", "recommended_stack", "milestones", "risks", "validation_steps"];
                                _i = 0, fieldsToCheck_1 = fieldsToCheck;
                                _a.label = 1;
                            case 1:
                                if (!(_i < fieldsToCheck_1.length)) return [3 /*break*/, 4];
                                field = fieldsToCheck_1[_i];
                                if (!(JSON.stringify(oldStructure[field]) !== JSON.stringify(newStructure[field]))) return [3 /*break*/, 3];
                                return [4 /*yield*/, (0, cognitive_service_1.logProjectEdit)(userId, id, field, oldStructure[field], newStructure[field])];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [4 /*yield*/, (0, cognitive_service_1.updateCognitiveProfile)(userId)];
                            case 5:
                                _a.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                e_1 = _a.sent();
                                console.error("[COGNITIVE] Error in post-update hook:", e_1);
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); })();
                return [2 /*return*/];
        }
    });
}); };
exports.updateProjectStructure = updateProjectStructure;
var bulkDeleteProjects = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, projectIds, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.user.id;
                projectIds = req.body.projectIds;
                if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: "No project IDs provided" })];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .delete()
                        .in("id", projectIds)
                        .eq("user_id", userId)];
            case 1:
                error = (_a.sent()).error;
                if (error)
                    throw new error_middleware_1.AppError("DB_ERROR", error.message);
                res.json({ message: "Projects deleted successfully" });
                return [2 /*return*/];
        }
    });
}); };
exports.bulkDeleteProjects = bulkDeleteProjects;
var wadi_brain_2 = require("../wadi-brain");
var generatePRD = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, project, fetchError, prd, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                userId = req.user.id;
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .select("*")
                        .eq("id", id)
                        .eq("user_id", userId)
                        .single()];
            case 1:
                _a = _b.sent(), project = _a.data, fetchError = _a.error;
                if (fetchError || !project)
                    throw new error_middleware_1.AppError("NOT_FOUND", "Proyecto no encontrado");
                if (project.prd && !req.query.force) {
                    return [2 /*return*/, res.json({ prd: project.prd })];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 5, , 6]);
                return [4 /*yield*/, (0, wadi_brain_2.generateProjectPRD)(project.name, project.description, project.structure)];
            case 3:
                prd = _b.sent();
                return [4 /*yield*/, supabase_1.supabase
                        .from("projects")
                        .update({ prd: prd, updated_at: new Date().toISOString() })
                        .eq("id", id)
                        .eq("user_id", userId)];
            case 4:
                _b.sent();
                res.json({ prd: prd });
                return [3 /*break*/, 6];
            case 5:
                err_2 = _b.sent();
                next(err_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.generatePRD = generatePRD;
