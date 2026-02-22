import { logger } from "../../core/logger";

export interface FeatureChange {
  path: string;
  content: string;
  action: "create" | "modify" | "delete";
}

export interface FeatureRecipe {
  id: string;
  name: string;
  description: string;
  changes: FeatureChange[];
}

class FeatureService {
  private recipes: Map<string, FeatureRecipe> = new Map();

  constructor() {
    // Basic Auth Feature Recipe
    this.recipes.set("basic-auth", {
      id: "basic-auth",
      name: "Basic Authentication",
      description: "Adds a simple authentication middleware and user service.",
      changes: [
        {
          path: "src/services/authService.ts",
          action: "create",
          content: `export class AuthService {\n  static async validate(token: string) {\n    return token === 'secret';\n  }\n}`
        },
        {
          path: "src/middleware/auth.ts",
          action: "create",
          content: `import { AuthService } from '../services/authService';\nexport const authMiddleware = async (req: any, res: any, next: any) => {\n  const token = req.headers.authorization;\n  if (await AuthService.validate(token)) return next();\n  res.status(401).send('Unauthorized');\n};`
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
          content: `import { drizzle } from 'drizzle-orm/postgres-js';\nimport postgres from 'postgres';\nimport * as schema from './schema';\n\nconst queryClient = postgres(process.env.DATABASE_URL!);\nexport const db = drizzle(queryClient, { schema });`
        },
        {
          path: "src/db/schema.ts",
          action: "create",
          content: `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';\n\nexport const users = pgTable('users', {\n  id: serial('id').primaryKey(),\n  name: text('name').notNull(),\n  email: text('email').notNull().unique(),\n  createdAt: timestamp('created_at').defaultNow(),\n});`
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
          content: `import { Request, Response } from 'express';\n\nexport const list\${entityCap} = async (req: Request, res: Response) => {\n  res.json({ message: 'List \${entityCap} works' });\n};\n\nexport const create\${entityCap} = async (req: Request, res: Response) => {\n  res.json({ message: 'Create \${entityCap} works' });\n};`
        },
        {
          path: "src/routes/\${entityLow}.routes.ts",
          action: "create",
          content: `import { Router } from 'express';\nimport { list\${entityCap}, create\${entityCap} } from '../controllers/\${entityLow}.controller';\n\nconst router = Router();\nrouter.get('/', list\${entityCap});\nrouter.post('/', create\${entityCap});\nexport default router;`
        }
      ]
    });
  }

  getRecipe(id: string, params: Record<string, string> = {}): FeatureRecipe | undefined {
    const raw = this.recipes.get(id);
    if (!raw) return undefined;

    // Deep clone and replace variables
    const recipe = JSON.parse(JSON.stringify(raw)) as FeatureRecipe;
    
    recipe.changes = recipe.changes.map(change => ({
      ...change,
      path: this.replaceVariables(change.path, params),
      content: this.replaceVariables(change.content, params)
    }));

    return recipe;
  }

  private replaceVariables(text: string, params: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  listRecipes(): FeatureRecipe[] {
    return Array.from(this.recipes.values());
  }
}

export const featureService = new FeatureService();
