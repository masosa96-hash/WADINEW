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
exports.getRelevantKnowledge = exports.extractAndSaveKnowledge = void 0;
var supabase_1 = require("../supabase");
var ai_service_1 = require("./ai-service");
var extractAndSaveKnowledge = function (userId, userMessage) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt_1, response, result, finalCategory, error, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                prompt_1 = "\n      Analiza el siguiente mensaje de un usuario.\n      1. Extrae \"hechos\" importantes (Personal, Proyecto, Preferencia).\n      2. Detecta si hay una INTENCI\u00D3N CLARA de iniciar un nuevo proyecto o sistema (ej: \"Quiero hacer una app\", \"Tengo idea de un SaaS\").\n      \n      Si no hay nada relevante, responde \"NONE\".\n      Si hay algo, responde en formato JSON: \n      {\n        \"content\": \"el hecho o resumen de la idea\", \n        \"category\": \"Personal|Proyecto|Preferencia\", \n        \"is_new_project_intention\": boolean,\n        \"confidence\": 0.0-1.0\n      }\n      \n      Mensaje: \"".concat(userMessage, "\"\n    ");
                return [4 /*yield*/, ai_service_1.smartLLM.chat.completions.create({
                        model: "gpt-4o-mini", // Or AI_MODELS.smart if we want to be generic
                        messages: [{ role: "system", content: "Sos un extractor de información y detector de intenciones." }, { role: "user", content: prompt_1 }],
                        response_format: { type: "json_object" }
                    })];
            case 1:
                response = _a.sent();
                result = JSON.parse(response.choices[0].message.content || '{}');
                if (!(result.content && result.content !== "NONE")) return [3 /*break*/, 3];
                finalCategory = result.is_new_project_intention ? 'PROJECT_SUGGESTION' : (result.category || 'General');
                return [4 /*yield*/, supabase_1.supabase
                        .from('wadi_knowledge_base')
                        .insert({
                        user_id: userId,
                        knowledge_point: result.content, // Map content -> knowledge_point
                        category: finalCategory,
                        confidence_score: (result.confidence || 1.0) * 10 // scale to integer if needed, or keep as float if DB changed, but Migration said integer. Assuming 1-10 scale or keeping 1. 
                    })];
            case 2:
                error = (_a.sent()).error;
                if (error)
                    console.error("Error guardando conocimiento:", error);
                return [2 /*return*/, result];
            case 3: return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.error("Error en extracción de conocimiento:", err_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, null];
        }
    });
}); };
exports.extractAndSaveKnowledge = extractAndSaveKnowledge;
var getRelevantKnowledge = function (userId, query) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabase_1.supabase
                    .from('wadi_knowledge_base')
                    .select('knowledge_point, category')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(10)];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error || !data)
                    return [2 /*return*/, ""];
                // Cast content to string if it's not (though DB says text)
                return [2 /*return*/, data.map(function (f) { return "[".concat(f.category, "]: ").concat(f.knowledge_point); }).join('\n')];
        }
    });
}); };
exports.getRelevantKnowledge = getRelevantKnowledge;
