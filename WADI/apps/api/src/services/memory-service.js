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
exports.memoryService = void 0;
var supabase_1 = require("../supabase");
var ai_service_1 = require("./ai-service");
var logger_1 = require("../core/logger");
var MemoryService = /** @class */ (function () {
    function MemoryService() {
    }
    MemoryService.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var openai, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        openai = (0, ai_service_1.getSmartLLM)();
                        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key") {
                            logger_1.logger.warn("[MEMORY] OpenAI key not found, using mock embedding");
                            return [2 /*return*/, new Array(1536).fill(0)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, openai.embeddings.create({
                                model: "text-embedding-3-small",
                                input: text,
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data[0].embedding];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error({ msg: "embedding_generation_failed", error: error_1.message });
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MemoryService.prototype.saveMemory = function (userId_1, content_1) {
        return __awaiter(this, arguments, void 0, function (userId, content, metadata, projectId) {
            var embedding, error, error_2;
            if (metadata === void 0) { metadata = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.generateEmbedding(content)];
                    case 1:
                        embedding = _a.sent();
                        return [4 /*yield*/, supabase_1.supabase.from("long_term_memory").insert({
                                user_id: userId,
                                project_id: projectId,
                                content: content,
                                metadata: metadata,
                                embedding: embedding
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        logger_1.logger.info({ msg: "memory_saved", userId: userId, projectId: projectId });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        logger_1.logger.error({ msg: "save_memory_failed", error: error_2.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MemoryService.prototype.searchMemories = function (userId_1, query_1) {
        return __awaiter(this, arguments, void 0, function (userId, query, limit) {
            var embedding, _a, data, error, error_3;
            if (limit === void 0) { limit = 3; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.generateEmbedding(query)];
                    case 1:
                        embedding = _b.sent();
                        return [4 /*yield*/, supabase_1.supabase.rpc("match_memories", {
                                query_embedding: embedding,
                                match_threshold: 0.5,
                                match_count: limit,
                                p_user_id: userId
                            })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 3:
                        error_3 = _b.sent();
                        logger_1.logger.error({ msg: "search_memory_failed", error: error_3.message });
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MemoryService;
}());
exports.memoryService = new MemoryService();
