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
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureService = void 0;
var FeatureService = /** @class */ (function () {
    function FeatureService() {
        this.recipes = new Map();
        // Basic Auth Feature Recipe
        this.recipes.set("basic-auth", {
            id: "basic-auth",
            name: "Basic Authentication",
            description: "Adds a simple authentication middleware and user service.",
            changes: [
                {
                    path: "src/services/authService.ts",
                    action: "create",
                    content: "export class AuthService {\n  static async validate(token: string) {\n    return token === 'secret';\n  }\n}"
                },
                {
                    path: "src/middleware/auth.ts",
                    action: "create",
                    content: "import { AuthService } from '../services/authService';\nexport const authMiddleware = async (req: any, res: any, next: any) => {\n  const token = req.headers.authorization;\n  if (await AuthService.validate(token)) return next();\n  res.status(401).send('Unauthorized');\n};"
                }
            ]
        });
        // Drizzle Postgres Recipe
        this.recipes.set("drizzle-postgres", {
            id: "drizzle-postgres",
            name: "Drizzle ORM + Postgres",
            description: "Configures Drizzle ORM and Postgres.js connection.",
            changes: [
                {
                    path: "src/db/index.ts",
                    action: "create",
                    content: "import { drizzle } from 'drizzle-orm/postgres-js';\nimport postgres from 'postgres';\nimport * as schema from './schema';\n\nconst queryClient = postgres(process.env.DATABASE_URL!);\nexport const db = drizzle(queryClient, { schema });"
                },
                {
                    path: "src/db/schema.ts",
                    action: "create",
                    content: "import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';\n\nexport const users = pgTable('users', {\n  id: serial('id').primaryKey(),\n  name: text('name').notNull(),\n  email: text('email').notNull().unique(),\n  createdAt: timestamp('created_at').defaultNow(),\n});"
                }
            ]
        });
        // Basic CRUD Recipe (Dynamic)
        this.recipes.set("basic-crud", {
            id: "basic-crud",
            name: "Basic CRUD",
            description: "Generates Controller and Route for a specific entity.",
            changes: [
                {
                    path: "src/controllers/\${entityLow}.controller.ts",
                    action: "create",
                    content: "import { Request, Response } from 'express';\n\nexport const list${entityCap} = async (req: Request, res: Response) => {\n  res.json({ message: 'List ${entityCap} works' });\n};\n\nexport const create${entityCap} = async (req: Request, res: Response) => {\n  res.json({ message: 'Create ${entityCap} works' });\n};"
                },
                {
                    path: "src/routes/\${entityLow}.routes.ts",
                    action: "create",
                    content: "import { Router } from 'express';\nimport { list${entityCap}, create${entityCap} } from '../controllers/${entityLow}.controller';\n\nconst router = Router();\nrouter.get('/', list${entityCap});\nrouter.post('/', create${entityCap});\nexport default router;"
                }
            ]
        });
    }
    FeatureService.prototype.getRecipe = function (id, params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        var raw = this.recipes.get(id);
        if (!raw)
            return undefined;
        // Deep clone and replace variables
        var recipe = JSON.parse(JSON.stringify(raw));
        recipe.changes = recipe.changes.map(function (change) { return (__assign(__assign({}, change), { path: _this.replaceVariables(change.path, params), content: _this.replaceVariables(change.content, params) })); });
        return recipe;
    };
    FeatureService.prototype.replaceVariables = function (text, params) {
        var result = text;
        for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            var regex = new RegExp("\\$\\{".concat(key, "\\}"), 'g');
            result = result.replace(regex, value);
        }
        return result;
    };
    FeatureService.prototype.listRecipes = function () {
        return Array.from(this.recipes.values());
    };
    return FeatureService;
}());
exports.featureService = new FeatureService();
