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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBrainStream = exports.CRYSTALLIZE_PROMPT_VERSION = exports.generateSystemPrompt = exports.toolRegistry = void 0;
exports.generateCrystallizeStructure = generateCrystallizeStructure;
exports.generateProjectPRD = generateProjectPRD;
exports.generateAuditPrompt = generateAuditPrompt;
var persona_1 = require("@wadi/persona");
var ai_service_1 = require("./services/ai-service");
var cognitive_service_1 = require("./services/cognitive-service");
var metrics_service_1 = require("./services/metrics.service");
var tool_registry_1 = require("./services/tool-registry");
Object.defineProperty(exports, "toolRegistry", { enumerable: true, get: function () { return tool_registry_1.toolRegistry; } });
var memory_service_1 = require("./services/memory-service");
var logger_1 = require("./core/logger");
require("./services/tools/file-tools");
require("./services/tools/build-checker");
require("./services/tools/git-tools");
require("./services/tools/project-scaffolding");
require("./services/tools/feature-orchestrator");
require("./services/tools/deploy-tool");
var crypto = require("crypto");
// ─── Prompt Layers ──────────────────────────────────────────────────────────
var SYSTEM_CORE = "You are a strategic thinking assistant focused on reducing ambiguity and generating actionable structure.\n\nCore rules:\n1. If the input is vague or abstract:\n   - Identify the ambiguity briefly.\n   - Abundantly propose 2\u20133 concrete interpretations or \"next steps\" instead of just asking questions.\n   - Choose the most realistic one provisionally to keep the momentum.\n   - Ask for confirmation at the end, but always provide value first.\n2. Never accept generic problem statements (e.g., \"Improve life\", \"Build with AI\"). Replace them with concrete definitions.\n3. When contradictions appear: state the trade-off, force a choice, and recommend a direction.\n4. Avoid endless questioning. Prefer proposing a plan and letting the user correct it.\n5. Always generate forward motion. Even when clarifying, provide a provisional structure or a draft.\n6. Prefer clarity over politeness. Prefer decisions over options. Prefer action over reflection.\n7. Output must be structured, concise, and actionable.";
var PERSONALIDAD_VISIBLE = "Tono y Reglas de Respuesta:\n- Habl\u00E1s en voseo rioplatense (che, ten\u00E9s, labur\u00E1s, decime, buildear).\n- Directo. Sin humo. Sin boludeces.\n- Abraz\u00E1 la ambig\u00FCedad inicial: si el usuario es vago, dec\u00ED \"Tengo un par de ideas de por d\u00F3nde ir, pero decime qu\u00E9 ten\u00E9s en mente primero y le damos forma.\"\n- Forz\u00E1 el avance: si algo es amplio, dec\u00ED \"Eso es demasiado amplio. Puede ser A, B o C. Asumo B y estructuro sobre eso.\"\n- Si hay contradicci\u00F3n: \"No pod\u00E9s optimizar X e Y a la vez. Eleg\u00ED una. Para MVP recomiendo X.\"\n- Cierre con impulso: \"La parte m\u00E1s d\u00E9bil de esta idea es X. Si eso falla, todo cae. Valid\u00E1 eso primero.\"";
var CRYSTALLIZE_MODE = "When generating structured output:\nProvide:\n- Clear problem definition.\n- Specific ICP (Ideal Customer Profile).\n- 3 concrete milestones (max 5).\n- 1 critical assumption that could break the project.\n- **templateId**: Optional stack selection (\"nextjs-tailwind\", \"vite-react-ts\") if applicable.\n- **features**: Optional list of feature objects {id, params?} to implement (\"basic-auth\", \"drizzle-postgres\", \"basic-crud\").\n- **terminal_commands**: Array of 3 key terminal commands (e.g., [\"pnpm install\", \"pnpm dev\", \"pnpm build\"]) to get started. \n- **orientation**: Either \"technical\" or \"business\" based on user intent.\n\nAvoid generic advice, motivational language, or filler content.";
var generateSystemPrompt = function (context) {
    if (context === void 0) { context = {}; }
    var memory = context.memory || "";
    var projectContext = context.projectContext || {};
    var topic = projectContext.description || "general";
    return {
        prompt: "\n".concat(SYSTEM_CORE, "\n\n").concat(PERSONALIDAD_VISIBLE, "\n\nUSER MEMORY: ").concat(memory, "\nPROJECT CONTEXT: ").concat(topic, "\n\nCRISTALIZACI\u00D3N:\nSi la idea tiene potencial real, tir\u00E1 el tag al final (invisible en UI):\n[CRYSTAL_CANDIDATE: {\"name\": \"...\", \"description\": \"...\", \"tags\": [...], \"templateId\": \"...\", \"features\": [{\"id\": \"...\", \"params\": {...}}], \"shouldDeploy\": false, \"deployProvider\": \"render\"}]"),
        decision: "UNIFIED_CORE"
    };
};
exports.generateSystemPrompt = generateSystemPrompt;
exports.CRYSTALLIZE_PROMPT_VERSION = 1;
var runBrainStream = function (userId_1, userMessage_1, context_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1, userMessage_1, context_1], args_1, true), void 0, function (userId, userMessage, context, provider) {
        var projectId, lastPersona, turnsActive, messageCount, personaInput, persona, globalAdjustments, memories, memoryContext, systemContent, client, model, messages, toolIterations, MAX_TOOL_ITERATIONS, totalTokensUsed, MAX_TOKENS_PER_RUN, _loop_1, state_1;
        var _a, _b, _c, _d;
        if (provider === void 0) { provider = 'fast'; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    projectId = context.projectId, lastPersona = context.lastPersona, turnsActive = context.turnsActive, messageCount = context.messageCount;
                    personaInput = {
                        userId: userId,
                        messageCount: messageCount || 1,
                        recentUserMsgLength: userMessage.length,
                        lastPersona: lastPersona,
                        turnsActive: turnsActive,
                        projectContext: {
                            description: context.projectDescription || ""
                        }
                    };
                    persona = (0, persona_1.resolvePersona)(personaInput);
                    return [4 /*yield*/, (0, cognitive_service_1.getGlobalPromptAdjustments)()];
                case 1:
                    globalAdjustments = _e.sent();
                    return [4 /*yield*/, memory_service_1.memoryService.searchMemories(userId, userMessage)];
                case 2:
                    memories = _e.sent();
                    memoryContext = memories.length > 0
                        ? "\nRECUERDOS RELEVANTES:\n".concat(memories.map(function (m) { return "- ".concat(m.content); }).join("\n"), "\n")
                        : "";
                    systemContent = "\n".concat(SYSTEM_CORE, "\n").concat(memoryContext, "\n\n").concat(persona.systemPrompt, "\n\n").concat(PERSONALIDAD_VISIBLE, "\n\n").concat(globalAdjustments, "\n\nCRISTALIZACI\u00D3N:\nSi la idea tiene potencial real, tir\u00E1 el tag al final:\n[CRYSTAL_CANDIDATE: {\"name\": \"...\", \"description\": \"...\", \"tags\": [...]}]");
                    client = provider === 'fast' ? ai_service_1.fastLLM : ai_service_1.smartLLM;
                    model = provider === 'fast' ? ai_service_1.AI_MODELS.fast : ai_service_1.AI_MODELS.smart;
                    messages = [
                        { role: "system", content: systemContent },
                        { role: "user", content: userMessage }
                    ];
                    toolIterations = 0;
                    MAX_TOOL_ITERATIONS = 5;
                    totalTokensUsed = 0;
                    MAX_TOKENS_PER_RUN = 50000;
                    _loop_1 = function () {
                        var controller, timeoutId, breaker, stream, fullContent_1, toolCalls, iterator_1, _loop_2, state_2, _f, toolCalls_1, tc, result, err_1;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    if (totalTokensUsed > MAX_TOKENS_PER_RUN) {
                                        logger_1.logger.warn({ msg: "safety_limit_reached_tokens", userId: userId, totalTokensUsed: totalTokensUsed });
                                        return [2 /*return*/, "break"];
                                    }
                                    controller = new AbortController();
                                    timeoutId = setTimeout(function () { return controller.abort(); }, 60000);
                                    _g.label = 1;
                                case 1:
                                    _g.trys.push([1, 11, , 12]);
                                    breaker = provider === "fast" ? ai_service_1.fastBreaker : ai_service_1.smartBreaker;
                                    return [4 /*yield*/, breaker.execute(function () { return client.chat.completions.create({
                                            model: model,
                                            stream: true,
                                            stream_options: { include_usage: true },
                                            temperature: 0.9,
                                            messages: messages,
                                            tools: tool_registry_1.toolRegistry.getToolDefinitions()
                                        }, {
                                            signal: controller.signal
                                        }); })];
                                case 2:
                                    stream = _g.sent();
                                    fullContent_1 = "";
                                    toolCalls = [];
                                    iterator_1 = stream[Symbol.asyncIterator]();
                                    _loop_2 = function () {
                                        var _h, chunk, done, delta, _j, _k, tc;
                                        return __generator(this, function (_l) {
                                            switch (_l.label) {
                                                case 0: return [4 /*yield*/, iterator_1.next()];
                                                case 1:
                                                    _h = _l.sent(), chunk = _h.value, done = _h.done;
                                                    if (done)
                                                        return [2 /*return*/, "break"];
                                                    if (chunk.usage) {
                                                        totalTokensUsed += chunk.usage.total_tokens;
                                                        metrics_service_1.metricsService.emitMetric(metrics_service_1.MetricEvent.TOKEN_USAGE, { provider: provider, model: model, tokens: chunk.usage });
                                                    }
                                                    delta = (_b = (_a = chunk.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.delta;
                                                    if (!delta)
                                                        return [2 /*return*/, "continue"];
                                                    if (delta.content) {
                                                        return [2 /*return*/, { value: {
                                                                    stream: (function () {
                                                                        return __asyncGenerator(this, arguments, function () {
                                                                            var _a, remainingChunk, done_1;
                                                                            var _b, _c, _d;
                                                                            return __generator(this, function (_e) {
                                                                                switch (_e.label) {
                                                                                    case 0:
                                                                                        fullContent_1 += delta.content;
                                                                                        return [4 /*yield*/, __await(chunk)];
                                                                                    case 1: return [4 /*yield*/, _e.sent()];
                                                                                    case 2:
                                                                                        _e.sent();
                                                                                        _e.label = 3;
                                                                                    case 3:
                                                                                        if (!true) return [3 /*break*/, 7];
                                                                                        return [4 /*yield*/, __await(iterator_1.next())];
                                                                                    case 4:
                                                                                        _a = _e.sent(), remainingChunk = _a.value, done_1 = _a.done;
                                                                                        if (done_1)
                                                                                            return [3 /*break*/, 7];
                                                                                        if ((_d = (_c = (_b = remainingChunk.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.delta) === null || _d === void 0 ? void 0 : _d.content) {
                                                                                            fullContent_1 += remainingChunk.choices[0].delta.content;
                                                                                        }
                                                                                        return [4 /*yield*/, __await(remainingChunk)];
                                                                                    case 5: return [4 /*yield*/, _e.sent()];
                                                                                    case 6:
                                                                                        _e.sent();
                                                                                        return [3 /*break*/, 3];
                                                                                    case 7:
                                                                                        // Background Memory Saving
                                                                                        if (fullContent_1.length > 50) {
                                                                                            memory_service_1.memoryService.saveMemory(userId, "User: ".concat(userMessage, "\nAssistant: ").concat(fullContent_1), { type: "chat_interaction" })
                                                                                                .catch(function (e) { return logger_1.logger.error({ msg: "background_memory_save_failed", error: e.message }); });
                                                                                        }
                                                                                        return [2 /*return*/];
                                                                                }
                                                                            });
                                                                        });
                                                                    })(),
                                                                    personaId: persona.personaId
                                                                } }];
                                                    }
                                                    if (delta.tool_calls) {
                                                        for (_j = 0, _k = delta.tool_calls; _j < _k.length; _j++) {
                                                            tc = _k[_j];
                                                            if (!toolCalls[tc.index]) {
                                                                toolCalls[tc.index] = { id: tc.id, function: { name: "", arguments: "" } };
                                                            }
                                                            if ((_c = tc.function) === null || _c === void 0 ? void 0 : _c.name)
                                                                toolCalls[tc.index].function.name += tc.function.name;
                                                            if ((_d = tc.function) === null || _d === void 0 ? void 0 : _d.arguments)
                                                                toolCalls[tc.index].function.arguments += tc.function.arguments;
                                                        }
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _g.label = 3;
                                case 3:
                                    if (!true) return [3 /*break*/, 5];
                                    return [5 /*yield**/, _loop_2()];
                                case 4:
                                    state_2 = _g.sent();
                                    if (typeof state_2 === "object")
                                        return [2 /*return*/, state_2];
                                    if (state_2 === "break")
                                        return [3 /*break*/, 5];
                                    return [3 /*break*/, 3];
                                case 5:
                                    if (!(toolCalls.length > 0)) return [3 /*break*/, 10];
                                    toolIterations++;
                                    messages.push({
                                        role: "assistant",
                                        tool_calls: toolCalls.map(function (tc) { return ({
                                            id: tc.id,
                                            type: "function",
                                            function: tc.function
                                        }); })
                                    });
                                    _f = 0, toolCalls_1 = toolCalls;
                                    _g.label = 6;
                                case 6:
                                    if (!(_f < toolCalls_1.length)) return [3 /*break*/, 9];
                                    tc = toolCalls_1[_f];
                                    return [4 /*yield*/, tool_registry_1.toolRegistry.callTool(tc.function.name, tc.function.arguments)];
                                case 7:
                                    result = _g.sent();
                                    messages.push({
                                        role: "tool",
                                        tool_call_id: tc.id,
                                        content: JSON.stringify(result)
                                    });
                                    _g.label = 8;
                                case 8:
                                    _f++;
                                    return [3 /*break*/, 6];
                                case 9: return [2 /*return*/, "continue"];
                                case 10: return [2 /*return*/, { value: {
                                            stream: (function () {
                                                return __asyncGenerator(this, arguments, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, __await({
                                                                    id: "mock",
                                                                    object: "chat.completion.chunk",
                                                                    created: Date.now(),
                                                                    model: model,
                                                                    choices: [{ delta: { content: "" }, index: 0, finish_reason: null }]
                                                                })];
                                                            case 1: return [4 /*yield*/, _a.sent()];
                                                            case 2:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                });
                                            })(),
                                            personaId: persona.personaId
                                        } }];
                                case 11:
                                    err_1 = _g.sent();
                                    clearTimeout(timeoutId);
                                    throw err_1;
                                case 12: return [2 /*return*/];
                            }
                        });
                    };
                    _e.label = 3;
                case 3:
                    if (!(toolIterations < MAX_TOOL_ITERATIONS)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1()];
                case 4:
                    state_1 = _e.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    if (state_1 === "break")
                        return [3 /*break*/, 5];
                    return [3 /*break*/, 3];
                case 5: throw new Error("Max tool iterations reached");
            }
        });
    });
};
exports.runBrainStream = runBrainStream;
var REQUIRED_KEYS = [
    "problem",
    "solution",
    "target_icp",
    "value_proposition",
    "recommended_stack",
    "milestones",
    "risks",
    "validation_steps",
];
function validateStructure(parsed) {
    for (var _i = 0, REQUIRED_KEYS_1 = REQUIRED_KEYS; _i < REQUIRED_KEYS_1.length; _i++) {
        var key = REQUIRED_KEYS_1[_i];
        if (!parsed[key])
            throw new Error("Missing key: ".concat(key));
    }
    var arrayKeys = ["milestones", "risks", "validation_steps"];
    for (var _a = 0, arrayKeys_1 = arrayKeys; _a < arrayKeys_1.length; _a++) {
        var key = arrayKeys_1[_a];
        if (!Array.isArray(parsed[key]) || parsed[key].length < 3) {
            throw new Error("Field \"".concat(key, "\" must be an array with at least 3 items"));
        }
    }
    return parsed;
}
/**
 * Calculates a SHA256 hash of the full prompt to detect modifications during Cold Freeze.
 */
function getPromptHash(systemPrompt, userPrompt) {
    return crypto
        .createHash("sha256")
        .update(systemPrompt + userPrompt)
        .digest("hex")
        .slice(0, 8); // 8 chars is enough for internal audit
}
function generateCrystallizeStructure(name_1, description_1) {
    return __awaiter(this, arguments, void 0, function (name, description, existingProjectNames, cognitiveProfileSummary) {
        var llm, temperatures, profileNote, globalAdjustments, systemPrompt, existingProjectsNote, userPrompt, _loop_3, attempt, state_3;
        var _a, _b, _c;
        if (existingProjectNames === void 0) { existingProjectNames = []; }
        if (cognitiveProfileSummary === void 0) { cognitiveProfileSummary = ""; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    llm = (0, ai_service_1.getSmartLLM)();
                    temperatures = [0.4, 0.2];
                    profileNote = cognitiveProfileSummary
                        ? "\n\nAdditional context about this user's patterns:\n".concat(cognitiveProfileSummary)
                        : "";
                    return [4 /*yield*/, (0, cognitive_service_1.getGlobalPromptAdjustments)()];
                case 1:
                    globalAdjustments = _d.sent();
                    systemPrompt = "\n".concat(SYSTEM_CORE, "\n\n").concat(CRYSTALLIZE_MODE, "\n\n").concat(PERSONALIDAD_VISIBLE, "\n\n").concat(profileNote, "\n").concat(globalAdjustments, "\n\nYour task is to transform a raw idea into a structured project brief in SPANISH.\nReturn ONLY valid JSON. No explanations, no markdown, no extra text.\n\nJSON Schema:\n{\n  \"problem\": \"string\",\n  \"solution\": \"string\",\n  \"target_icp\": \"string\",\n  \"value_proposition\": \"string\",\n  \"recommended_stack\": \"string\",\n  \"milestones\": [\"string x 3\"],\n  \"risks\": [\"string x 3\"],\n  \"validation_steps\": [\"string x 3\"],\n  \"terminal_commands\": [\"string x 3\"],\n  \"orientation\": \"technical | business\"\n}");
                    existingProjectsNote = existingProjectNames.length > 0
                        ? "\n\nExisting Projects (avoid duplication):\n".concat(existingProjectNames.join(", "))
                        : "";
                    userPrompt = "Idea Name: ".concat(name, "\n\nIdea Description:\n").concat(description).concat(existingProjectsNote, "\n\nGenerate the structured project brief.");
                    _loop_3 = function (attempt) {
                        var startedAt, response, duration, pHash, raw, cleaned, parsed, err_2, duration;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    startedAt = Date.now();
                                    _e.label = 1;
                                case 1:
                                    _e.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, ai_service_1.smartBreaker.execute(function () { return Promise.race([
                                            llm.chat.completions.create({
                                                model: ai_service_1.AI_MODELS.smart,
                                                temperature: temperatures[attempt],
                                                top_p: 0.9,
                                                max_tokens: 1500,
                                                messages: [
                                                    { role: "system", content: systemPrompt },
                                                    { role: "user", content: userPrompt.slice(0, 6000) },
                                                ],
                                            }, { timeout: 30000 }),
                                            new Promise(function (_, reject) { return setTimeout(function () { return reject(new Error("LLM_HARD_TIMEOUT")); }, 35000); })
                                        ]); })];
                                case 2:
                                    response = _e.sent();
                                    duration = Date.now() - startedAt;
                                    pHash = getPromptHash(systemPrompt, userPrompt.slice(0, 6000));
                                    console.log("[CRYSTALLIZE] project_id=".concat(name.slice(0, 10), "... p_hash=").concat(pHash, " model=").concat(ai_service_1.AI_MODELS.smart, " duration=").concat(duration, "ms attempt=").concat(attempt + 1, " status=SUCCESS"));
                                    raw = (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "";
                                    cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
                                    parsed = JSON.parse(cleaned);
                                    return [2 /*return*/, { value: validateStructure(parsed) }];
                                case 3:
                                    err_2 = _e.sent();
                                    duration = Date.now() - startedAt;
                                    console.warn("[CRYSTALLIZE] project_id=".concat(name.slice(0, 10), "... attempt=").concat(attempt + 1, " duration=").concat(duration, "ms status=FAILED error=").concat(err_2.message));
                                    if (attempt === temperatures.length - 1) {
                                        throw new Error("LLM returned invalid structure after ".concat(attempt + 1, " attempts: ").concat(err_2.message));
                                    }
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _d.label = 2;
                case 2:
                    if (!(attempt < temperatures.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_3(attempt)];
                case 3:
                    state_3 = _d.sent();
                    if (typeof state_3 === "object")
                        return [2 /*return*/, state_3.value];
                    _d.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 2];
                case 5: 
                // Unreachable but TypeScript needs it
                throw new Error("Crystallize structure generation failed");
            }
        });
    });
}
function generateProjectPRD(name, description, structure) {
    return __awaiter(this, void 0, void 0, function () {
        var llm, globalAdjustments, systemPrompt, userPrompt, response;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    llm = (0, ai_service_1.getSmartLLM)();
                    return [4 /*yield*/, (0, cognitive_service_1.getGlobalPromptAdjustments)()];
                case 1:
                    globalAdjustments = _d.sent();
                    systemPrompt = "\n".concat(SYSTEM_CORE, "\n\n").concat(PERSONALIDAD_VISIBLE, "\n\n").concat(globalAdjustments, "\n\nYour task is to generate a high-impact, direct, and technically dense PRD (Product Requirements Document) for a project.\nAvoid corporate bloat. Focus on:\n1. Executive Summary (The \"Based\" take on why this exists).\n2. technical Architecture (Proposed stack and data flow).\n3. Core Features Spec (Markdown tables or clear lists).\n4. Success Metrics (What actually matters, not vanity metrics).\n5. Roadmap (Phase 1, 2, 3).\n\nTone: Socio Operacional (Rioplatense, Based, Direct).\nLanguage: Spanish.\nOutput: Markdown.");
                    userPrompt = "Project Name: ".concat(name, "\nProject Description: ").concat(description, "\nCurrent Structure: ").concat(JSON.stringify(structure), "\n\nGenerate the PRD.");
                    return [4 /*yield*/, ai_service_1.smartBreaker.execute(function () { return llm.chat.completions.create({
                            model: ai_service_1.AI_MODELS.smart,
                            temperature: 0.7,
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: userPrompt },
                            ],
                        }); })];
                case 2:
                    response = _d.sent();
                    return [2 /*return*/, (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "Error al generar el PRD."];
            }
        });
    });
}
function generateAuditPrompt() {
    return "\n    Sos WADI. Licuadora de Conocimiento.\n    Analiz\u00E1: \u00BFQu\u00E9 nivel de \"Sabidur\u00EDa Cuestionable\" tiene el usuario?\n    \n    Output JSON:\n    [\n      {\n        \"level\": \"HIGH\", \n        \"title\": \"SABIDUR\u00CDA_CUESTIONABLE (Ej: DATOS_INVENTADOS, FILOSOF\u00CDA_BARATA, HUMO_DENSO)\",\n        \"description\": \"Una frase sarc\u00E1stica exponiendo la falacia.\"\n      }\n    ]\n  ";
}
