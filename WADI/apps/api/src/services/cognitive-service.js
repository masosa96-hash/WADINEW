"use strict";
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
exports.logProjectEdit = logProjectEdit;
exports.updateCognitiveProfile = updateCognitiveProfile;
exports.applyProfileDecay = applyProfileDecay;
exports.getCognitiveProfileSummary = getCognitiveProfileSummary;
exports.runGlobalMetaAnalysis = runGlobalMetaAnalysis;
exports.runDailySnapshot = runDailySnapshot;
exports.getGlobalPromptAdjustments = getGlobalPromptAdjustments;
var supabase_1 = require("../supabase");
var SCORE_RANGE = { MIN: -5, MAX: 5 };
var MIN_REPETITIONS = 3;
var DECAY_FACTOR = 0.95; // Profiles tend to 0 over time to prevent rigidity
/**
 * Log a specific field edit in a project structure
 */
function logProjectEdit(userId, projectId, field, oldVal, newVal) {
    return __awaiter(this, void 0, void 0, function () {
        var oldLen, newLen, editDirection, diffSummary, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldLen = JSON.stringify(oldVal).length;
                    newLen = JSON.stringify(newVal).length;
                    editDirection = "OVERWRITE";
                    if (newLen > oldLen * 1.5)
                        editDirection = "EXPAND";
                    if (newLen < oldLen * 0.5)
                        editDirection = "DELETE_HEAVY";
                    diffSummary = "".concat(editDirection, ": Changed ").concat(field, " from length ").concat(oldLen, " to ").concat(newLen);
                    console.log("[DASHBOARD_SIGNAL] event=PROJECT_EDIT user_id=".concat(userId, " project_id=").concat(projectId, " field=").concat(field, " direction=").concat(editDirection));
                    return [4 /*yield*/, supabase_1.supabase
                            .from("project_edits")
                            .insert([{
                                user_id: userId,
                                project_id: projectId,
                                field: field,
                                original_value: typeof oldVal === 'string' ? oldVal : JSON.stringify(oldVal),
                                edited_value: typeof newVal === 'string' ? newVal : JSON.stringify(newVal),
                                diff_summary: diffSummary
                            }])];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        console.error("[COGNITIVE] Error logging edit:", error.message);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Heuristics-based profile update
 * Analyzes last edits and adjusts scores if a pattern repeats
 */
function updateCognitiveProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, recentEdits, editsErr, _b, profile, profErr, currentProfile, _c, newProf, initErr, updates, stackEdits, reducesComplexity, addsComplexity, milestoneEdits, getCount_1, reducesMilestones, addsMilestones, nextVersion, err_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from("project_edits")
                            .select("*")
                            .eq("user_id", userId)
                            .order("created_at", { ascending: false })
                            .limit(20)];
                case 1:
                    _a = _d.sent(), recentEdits = _a.data, editsErr = _a.error;
                    if (editsErr || !recentEdits)
                        return [2 /*return*/];
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_current")
                            .select("*")
                            .eq("user_id", userId)
                            .single()];
                case 2:
                    _b = _d.sent(), profile = _b.data, profErr = _b.error;
                    currentProfile = void 0;
                    if (!(profErr || !profile)) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_current")
                            .insert([{ user_id: userId }])
                            .select()
                            .single()];
                case 3:
                    _c = _d.sent(), newProf = _c.data, initErr = _c.error;
                    if (initErr)
                        return [2 /*return*/];
                    currentProfile = newProf;
                    return [3 /*break*/, 5];
                case 4:
                    currentProfile = profile;
                    _d.label = 5;
                case 5:
                    updates = {};
                    stackEdits = recentEdits.filter(function (e) { return e.field === 'recommended_stack'; });
                    if (stackEdits.length >= MIN_REPETITIONS) {
                        reducesComplexity = stackEdits.slice(0, MIN_REPETITIONS).every(function (e) { return e.edited_value.length < e.original_value.length; });
                        addsComplexity = stackEdits.slice(0, MIN_REPETITIONS).every(function (e) { return e.edited_value.length > e.original_value.length; });
                        if (reducesComplexity)
                            updates.stack_complexity_score = Math.max(SCORE_RANGE.MIN, currentProfile.stack_complexity_score - 1);
                        if (addsComplexity)
                            updates.stack_complexity_score = Math.min(SCORE_RANGE.MAX, currentProfile.stack_complexity_score + 1);
                    }
                    milestoneEdits = recentEdits.filter(function (e) { return e.field === 'milestones'; });
                    if (milestoneEdits.length >= MIN_REPETITIONS) {
                        getCount_1 = function (val) { try {
                            return JSON.parse(val).length;
                        }
                        catch (_a) {
                            return 0;
                        } };
                        reducesMilestones = milestoneEdits.slice(0, MIN_REPETITIONS).every(function (e) { return getCount_1(e.edited_value) < getCount_1(e.original_value); });
                        addsMilestones = milestoneEdits.slice(0, MIN_REPETITIONS).every(function (e) { return getCount_1(e.edited_value) > getCount_1(e.original_value); });
                        if (reducesMilestones)
                            updates.milestone_length_score = Math.max(SCORE_RANGE.MIN, currentProfile.milestone_length_score - 1);
                        if (addsMilestones)
                            updates.milestone_length_score = Math.min(SCORE_RANGE.MAX, currentProfile.milestone_length_score + 1);
                    }
                    if (!(Object.keys(updates).length > 0)) return [3 /*break*/, 8];
                    nextVersion = currentProfile.profile_version + 1;
                    // Update profile
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_current")
                            .update(__assign(__assign({}, updates), { profile_version: nextVersion, updated_at: new Date().toISOString() }))
                            .eq("user_id", userId)];
                case 6:
                    // Update profile
                    _d.sent();
                    // Save snapshot to history
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_history")
                            .insert([{
                                user_id: userId,
                                profile_snapshot: __assign(__assign({}, currentProfile), updates),
                                profile_version: nextVersion
                            }])];
                case 7:
                    // Save snapshot to history
                    _d.sent();
                    console.log("[COGNITIVE] Profile updated & snapshot saved for user ".concat(userId), updates);
                    _d.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    err_1 = _d.sent();
                    console.error("[COGNITIVE] Update failed:", err_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * PHASE 4: Score Decay
 * Gradually normalizes profiles towards 0 to maintain flexibility.
 */
function applyProfileDecay(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, p, updates, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_current")
                            .select("*")
                            .eq("user_id", userId)
                            .single()];
                case 1:
                    profile = (_a.sent()).data;
                    if (!profile)
                        return [2 /*return*/];
                    p = profile;
                    updates = {
                        stack_complexity_score: Math.round(p.stack_complexity_score * DECAY_FACTOR * 10) / 10,
                        milestone_length_score: Math.round(p.milestone_length_score * DECAY_FACTOR * 10) / 10,
                        risk_tolerance_score: Math.round(p.risk_tolerance_score * DECAY_FACTOR * 10) / 10,
                        scope_bias_score: Math.round(p.scope_bias_score * DECAY_FACTOR * 10) / 10,
                        updated_at: new Date().toISOString()
                    };
                    return [4 /*yield*/, supabase_1.supabase
                            .from("user_cognitive_profile_current")
                            .update(updates)
                            .eq("user_id", userId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error("[COGNITIVE] Decay failed:", e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns a natural language summary of the user cognitive profile for prompt injection
 */
function getCognitiveProfileSummary(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, tendencies, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from("user_cognitive_profile_current")
                        .select("*")
                        .eq("user_id", userId)
                        .single()];
                case 1:
                    profile = (_a.sent()).data;
                    if (!profile)
                        return [2 /*return*/, ""];
                    tendencies = [];
                    p = profile;
                    if (p.stack_complexity_score < 0)
                        tendencies.push("Prefers lean MVP stacks, avoids over-engineering.");
                    if (p.stack_complexity_score > 0)
                        tendencies.push("Values robust, scalable infrastructure.");
                    if (p.milestone_length_score < 0)
                        tendencies.push("Favors short, high-impact milestone lists.");
                    if (p.milestone_length_score > 0)
                        tendencies.push("Prefers granular and detailed project roadmaps.");
                    if (p.risk_tolerance_score < 0)
                        tendencies.push("Extremely risk-averse; prioritizes validation before any development.");
                    if (p.scope_bias_score < 0)
                        tendencies.push("Strong bias towards minimal scope to accelerate time-to-market.");
                    if (tendencies.length === 0)
                        return [2 /*return*/, ""];
                    return [2 /*return*/, "User patterns and tendencies observed from previous project edits:\n- ".concat(tendencies.join("\n- "))];
            }
        });
    });
}
/**
 * PHASE 2/4: Global Meta-Analysis Job
 * Refined with atomicity and analytics.
 */
function runGlobalMetaAnalysis() {
    return __awaiter(this, void 0, void 0, function () {
        var analysisId, thirtyDaysAgo, _a, edits, error, stats, getCount, _i, _b, edit, uniqueProjects, avgEditsPerProject, _c, _d, _e, field, data, frequency, patternName, err_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    analysisId = Math.random().toString(36).substring(7);
                    console.log("[COGNITIVE] Starting global analysis ".concat(analysisId, "..."));
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 9, , 10]);
                    thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return [4 /*yield*/, supabase_1.supabase
                            .from("project_edits")
                            .select("field, original_value, edited_value, project_id")
                            .gt("created_at", thirtyDaysAgo.toISOString())];
                case 2:
                    _a = _f.sent(), edits = _a.data, error = _a.error;
                    if (error || !edits)
                        return [2 /*return*/];
                    stats = {
                        milestones: { total: 0, reductions: 0 },
                        recommended_stack: { total: 0, reductions: 0 }
                    };
                    getCount = function (val) { try {
                        return JSON.parse(val).length;
                    }
                    catch (_a) {
                        return 0;
                    } };
                    for (_i = 0, _b = edits; _i < _b.length; _i++) {
                        edit = _b[_i];
                        if (edit.field === 'milestones') {
                            stats.milestones.total++;
                            if (getCount(edit.edited_value) < getCount(edit.original_value))
                                stats.milestones.reductions++;
                        }
                        if (edit.field === 'recommended_stack') {
                            stats.recommended_stack.total++;
                            if (edit.edited_value.length < edit.original_value.length)
                                stats.recommended_stack.reductions++;
                        }
                    }
                    uniqueProjects = new Set(edits.map(function (e) { return e.project_id; })).size;
                    avgEditsPerProject = uniqueProjects > 0 ? edits.length / uniqueProjects : 0;
                    _c = 0, _d = Object.entries(stats);
                    _f.label = 3;
                case 3:
                    if (!(_c < _d.length)) return [3 /*break*/, 6];
                    _e = _d[_c], field = _e[0], data = _e[1];
                    if (data.total < 10)
                        return [3 /*break*/, 5];
                    frequency = data.reductions / data.total;
                    patternName = "REDUCE_".concat(field.toUpperCase());
                    if (!(frequency > 0.6 || frequency < 0.2)) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabase_1.supabase
                            .from("global_patterns")
                            .upsert({
                            pattern: patternName,
                            frequency: frequency,
                            confidence_score: Math.min(1.0, data.total / 100),
                            sample_size: data.total,
                            last_updated: new Date().toISOString()
                        }, { onConflict: 'pattern' })];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _c++;
                    return [3 /*break*/, 3];
                case 6: 
                // Record Analytics
                return [4 /*yield*/, supabase_1.supabase
                        .from("adaptive_analytics")
                        .upsert({
                        date: new Date().toISOString().split('T')[0],
                        avg_edits_per_project: avgEditsPerProject,
                        sample_size: edits.length,
                        created_at: new Date().toISOString()
                    }, { onConflict: 'date' })];
                case 7:
                    // Record Analytics
                    _f.sent();
                    console.log("[COGNITIVE] Global meta-analysis ".concat(analysisId, " completed."));
                    // Trigger snapshot after analysis
                    return [4 /*yield*/, runDailySnapshot()];
                case 8:
                    // Trigger snapshot after analysis
                    _f.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_2 = _f.sent();
                    console.error("[COGNITIVE] Global analysis ".concat(analysisId, " failed:"), err_2);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates a historical snapshot of the day's key metrics for comparison.
 */
function runDailySnapshot() {
    return __awaiter(this, void 0, void 0, function () {
        var date, startOfDay, totalProjects, _a, crystallizeCount, successfulProjects, validTtv, avgTtv, editCount, failedCount, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    date = new Date().toISOString().split('T')[0];
                    console.log("[SNAPSHOT] Generating daily snapshot for ".concat(date, "..."));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    startOfDay = new Date();
                    startOfDay.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, supabase_1.supabase
                            .from("projects")
                            .select("*", { count: "exact", head: true })
                            .gt("created_at", startOfDay.toISOString())];
                case 2:
                    totalProjects = (_b.sent()).count;
                    return [4 /*yield*/, supabase_1.supabase
                            .from("projects")
                            .select("ttv_ms", { count: "exact" })
                            .eq("status", "READY")
                            .gt("updated_at", startOfDay.toISOString())];
                case 3:
                    _a = _b.sent(), crystallizeCount = _a.count, successfulProjects = _a.data;
                    validTtv = (successfulProjects || []).filter(function (p) { return p.ttv_ms; }).map(function (p) { return p.ttv_ms; });
                    avgTtv = validTtv.length > 0 ? validTtv.reduce(function (a, b) { return a + b; }, 0) / validTtv.length : 0;
                    return [4 /*yield*/, supabase_1.supabase
                            .from("project_edits")
                            .select("*", { count: "exact", head: true })
                            .gt("created_at", startOfDay.toISOString())];
                case 4:
                    editCount = (_b.sent()).count;
                    return [4 /*yield*/, supabase_1.supabase
                            .from("projects")
                            .select("*", { count: "exact", head: true })
                            .eq("status", "STRUCTURE_FAILED")
                            .gt("updated_at", startOfDay.toISOString())];
                case 5:
                    failedCount = (_b.sent()).count;
                    return [4 /*yield*/, supabase_1.supabase
                            .from("daily_snapshots")
                            .upsert({
                            date: date,
                            total_projects: totalProjects || 0,
                            crystallize_count: crystallizeCount || 0,
                            edit_count: editCount || 0,
                            structure_failed_count: failedCount || 0,
                            avg_llm_duration_ms: avgTtv, // Using avg TTV as proxy for value delivery speed
                            created_at: new Date().toISOString()
                        }, { onConflict: 'date' })];
                case 6:
                    _b.sent();
                    console.log("[SNAPSHOT] Daily snapshot completed for ".concat(date));
                    return [3 /*break*/, 8];
                case 7:
                    err_3 = _b.sent();
                    console.error("[SNAPSHOT] Snapshot failed:", err_3);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns dynamic instructions for the base prompt based on global patterns
 */
function getGlobalPromptAdjustments() {
    return __awaiter(this, void 0, void 0, function () {
        var patterns, adjustments, _i, _a, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from("global_patterns")
                        .select("*")
                        .gt("frequency", 0.6)
                        .gt("confidence_score", 0.3)];
                case 1:
                    patterns = (_b.sent()).data;
                    if (!patterns || patterns.length === 0)
                        return [2 /*return*/, ""];
                    adjustments = [];
                    for (_i = 0, _a = patterns; _i < _a.length; _i++) {
                        p = _a[_i];
                        if (p.pattern === 'REDUCE_MILESTONES') {
                            adjustments.push("Default to a leaner milestone list (3-4 items) unless complexity strictly requires more, as most users prefer smaller scopes.");
                        }
                        if (p.pattern === 'REDUCE_RECOMMENDED_STACK') {
                            adjustments.push("Prefer minimalist technology stacks over complex infrastructure by default.");
                        }
                    }
                    if (adjustments.length === 0)
                        return [2 /*return*/, ""];
                    return [2 /*return*/, "\nGLOBAL PRODUCT PATTERNS (V".concat(patterns.length, "):\n- ").concat(adjustments.join("\n- "))];
            }
        });
    });
}
