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
exports.metricsService = exports.MetricEvent = void 0;
var events_1 = require("events");
var logger_1 = require("../core/logger");
var supabase_1 = require("../supabase");
var event_bus_1 = require("../core/event-bus");
var execution_policy_1 = require("../core/execution-policy");
// ─── Legacy metric enum (kept for backward compatibility) ──────────────────────
var MetricEvent;
(function (MetricEvent) {
    MetricEvent["BREAKER_TRANSITION"] = "breaker_transition";
    MetricEvent["TOKEN_USAGE"] = "token_usage";
    MetricEvent["PROJECT_CRYSTALLIZED"] = "project_crystallized";
    MetricEvent["COGNITIVE_ADJUSTMENT"] = "cognitive_adjustment";
    MetricEvent["CHAT_STREAM_ERROR"] = "chat_stream_error";
})(MetricEvent || (exports.MetricEvent = MetricEvent = {}));
// ─── Token pricing model (per 1M tokens) ──────────────────────────────────────
var TOKEN_PRICE_USD = {
    "gpt-4o": { input: 2.50, output: 10.00 },
    "gpt-4o-mini": { input: 0.15, output: 0.60 },
    "gpt-4-turbo": { input: 10.00, output: 30.00 },
    "llama3-70b": { input: 0.59, output: 0.79 }, // Groq
    "llama3-8b": { input: 0.05, output: 0.08 },
    "default": { input: 1.00, output: 3.00 },
};
function estimateCostUSD(model, promptTokens, completionTokens) {
    var _a;
    var price = (_a = TOKEN_PRICE_USD[model]) !== null && _a !== void 0 ? _a : TOKEN_PRICE_USD["default"];
    return (promptTokens / 1000000) * price.input + (completionTokens / 1000000) * price.output;
}
// ─── In-memory counters (lightweight, no DB overhead for hot path) ─────────────
var runTimestamps = new Map(); // correlationId → start_ms
var buildStatusCounts = { OK: 0, WARN: 0, ERROR: 0, RISK: 0 };
var deployAttempts = 0;
var deployFailures = 0;
// ─── MetricsService ────────────────────────────────────────────────────────────
var MetricsService = /** @class */ (function (_super) {
    __extends(MetricsService, _super);
    function MetricsService() {
        var _this = _super.call(this) || this;
        _this.setupLegacyListeners();
        _this.subscribeToEventBus();
        return _this;
    }
    // ── Legacy listeners (backward compat) ──────────────────────────────────────
    MetricsService.prototype.setupLegacyListeners = function () {
        var _this = this;
        this.on(MetricEvent.BREAKER_TRANSITION, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info(__assign({ msg: "metric_captured", event: MetricEvent.BREAKER_TRANSITION }, data));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase_1.supabase.from("breaker_metrics").insert({
                                breaker_name: data.name,
                                from_state: data.from,
                                to_state: data.to
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        logger_1.logger.error({ msg: "failed_to_persist_breaker_metric", error: e_1.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.on(MetricEvent.TOKEN_USAGE, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var costUSD, e_2;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        logger_1.logger.info(__assign({ msg: "metric_captured", event: MetricEvent.TOKEN_USAGE }, data));
                        costUSD = estimateCostUSD((_a = data.model) !== null && _a !== void 0 ? _a : "default", (_c = (_b = data.tokens) === null || _b === void 0 ? void 0 : _b.prompt_tokens) !== null && _c !== void 0 ? _c : 0, (_e = (_d = data.tokens) === null || _d === void 0 ? void 0 : _d.completion_tokens) !== null && _e !== void 0 ? _e : 0);
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase_1.supabase.from("token_usage").insert({
                                project_id: data.projectId,
                                user_id: data.userId,
                                provider: data.provider,
                                model: data.model || "unknown",
                                prompt_tokens: data.tokens.prompt_tokens,
                                completion_tokens: data.tokens.completion_tokens,
                                total_tokens: data.tokens.total_tokens,
                                cost_usd: costUSD
                            })];
                    case 2:
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _f.sent();
                        logger_1.logger.error({ msg: "failed_to_persist_token_metric", error: e_2.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.on(MetricEvent.PROJECT_CRYSTALLIZED, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var costUSD, e_3;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        logger_1.logger.info(__assign({ msg: "metric_captured", event: MetricEvent.PROJECT_CRYSTALLIZED }, data));
                        costUSD = estimateCostUSD((_a = data.model) !== null && _a !== void 0 ? _a : "default", (_c = (_b = data.tokens) === null || _b === void 0 ? void 0 : _b.prompt_tokens) !== null && _c !== void 0 ? _c : 0, (_e = (_d = data.tokens) === null || _d === void 0 ? void 0 : _d.completion_tokens) !== null && _e !== void 0 ? _e : 0);
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 5, , 6]);
                        if (!data.projectId) return [3 /*break*/, 3];
                        return [4 /*yield*/, supabase_1.supabase.from("projects")
                                .update({ conversion_time_ms: data.durationMs })
                                .eq("id", data.projectId)];
                    case 2:
                        _j.sent();
                        _j.label = 3;
                    case 3: return [4 /*yield*/, supabase_1.supabase.from("token_usage").insert({
                            project_id: data.projectId,
                            provider: data.provider,
                            model: data.model,
                            prompt_tokens: (_f = data.tokens) === null || _f === void 0 ? void 0 : _f.prompt_tokens,
                            completion_tokens: (_g = data.tokens) === null || _g === void 0 ? void 0 : _g.completion_tokens,
                            total_tokens: (_h = data.tokens) === null || _h === void 0 ? void 0 : _h.total_tokens,
                            cost_usd: costUSD
                        })];
                    case 4:
                        _j.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_3 = _j.sent();
                        logger_1.logger.error({ msg: "failed_to_persist_crystallized_metric", error: e_3.message });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        this.on(MetricEvent.COGNITIVE_ADJUSTMENT, function (data) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info(__assign({ msg: "metric_captured", event: MetricEvent.COGNITIVE_ADJUSTMENT }, data));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, supabase_1.supabase.from("cognitive_metrics").insert({
                                user_id: data.userId,
                                bias_detected: data.biasDetected,
                                confidence_score: data.confidenceScore,
                                adjustment_applied: data.adjustmentApplied
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        logger_1.logger.error({ msg: "failed_to_persist_cognitive_metric", error: e_4.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    // ── Event Bus subscriptions (new in Phase 16) ────────────────────────────────
    MetricsService.prototype.subscribeToEventBus = function () {
        var _this = this;
        // Track run start time for duration measurement
        event_bus_1.eventBus.on("SCAFFOLDING_COMPLETE", function (_a) {
            var projectId = _a.projectId, correlationId = _a.correlationId;
            if (!runTimestamps.has(correlationId)) {
                runTimestamps.set(correlationId, Date.now());
            }
        });
        // Build status breakdown
        event_bus_1.eventBus.on("BUILD_VERIFIED", function (_a) {
            var projectId = _a.projectId, correlationId = _a.correlationId, result = _a.result;
            buildStatusCounts[result.status]++;
            logger_1.logger.info({
                msg: "metric_build_verified",
                projectId: projectId,
                correlationId: correlationId,
                buildStatus: result.status,
                buildStatusTotals: __assign({}, buildStatusCounts)
            });
        });
        // Deploy attempt tracking
        event_bus_1.eventBus.on("DEPLOYMENT_COMPLETE", function (_a) {
            var projectId = _a.projectId, correlationId = _a.correlationId, result = _a.result;
            deployAttempts++;
            if (!result.success) {
                deployFailures++;
                logger_1.logger.warn({
                    msg: "metric_deploy_failed",
                    projectId: projectId,
                    correlationId: correlationId,
                    failureRate: _this.deployFailureRate(),
                    error: result.error
                });
            }
            else {
                logger_1.logger.info({
                    msg: "metric_deploy_success",
                    projectId: projectId,
                    correlationId: correlationId,
                    url: result.url,
                    failureRate: _this.deployFailureRate()
                });
            }
            // Persist deploy result
            _this.persistDeployMetric(projectId, correlationId, result).catch(function () { });
        });
        // Materialization duration + cost summary
        event_bus_1.eventBus.on("MATERIALIZATION_COMPLETE", function (_a) {
            var projectId = _a.projectId, correlationId = _a.correlationId, success = _a.success, filesCreated = _a.filesCreated;
            var startMs = runTimestamps.get(correlationId);
            var durationMs = startMs ? Date.now() - startMs : undefined;
            runTimestamps.delete(correlationId);
            logger_1.logger.info({
                msg: "metric_materialization_complete",
                projectId: projectId,
                correlationId: correlationId,
                success: success,
                filesCreated: filesCreated,
                durationMs: durationMs,
                buildStatusTotals: __assign({}, buildStatusCounts),
                deployFailureRate: _this.deployFailureRate()
            });
            // Persist run summary
            _this.persistRunMetric(projectId, correlationId, success, filesCreated, durationMs).catch(function () { });
        });
        // Run failures
        event_bus_1.eventBus.on("RUN_FAILED", function (_a) {
            var projectId = _a.projectId, correlationId = _a.correlationId, step = _a.step, error = _a.error;
            logger_1.logger.error({ msg: "metric_run_failed", projectId: projectId, correlationId: correlationId, step: step, error: error });
        });
    };
    // ── Derived metrics ──────────────────────────────────────────────────────────
    MetricsService.prototype.deployFailureRate = function () {
        if (deployAttempts === 0)
            return 0;
        return Math.round((deployFailures / deployAttempts) * 100);
    };
    MetricsService.prototype.buildStatusSummary = function () {
        return __assign({}, buildStatusCounts);
    };
    // ── Persistence helpers ──────────────────────────────────────────────────────
    MetricsService.prototype.persistDeployMetric = function (projectId, correlationId, result) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase.from("deploy_metrics").insert({
                                project_id: projectId,
                                correlation_id: correlationId,
                                provider: result.provider,
                                success: result.success,
                                url: result.url,
                                error: result.error,
                                execution_mode: execution_policy_1.ExecutionPolicy.mode,
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MetricsService.prototype.persistRunMetric = function (projectId, correlationId, success, filesCreated, durationMs) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase.from("run_metrics").insert({
                                project_id: projectId,
                                correlation_id: correlationId,
                                success: success,
                                files_created: filesCreated,
                                duration_ms: durationMs,
                                execution_mode: execution_policy_1.ExecutionPolicy.mode,
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ── Public emit (legacy API) ─────────────────────────────────────────────────
    MetricsService.prototype.emitMetric = function (event, data) {
        this.emit(event, __assign(__assign({}, data), { timestamp: new Date().toISOString() }));
    };
    return MetricsService;
}(events_1.EventEmitter));
exports.metricsService = new MetricsService();
