"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = void 0;
var NEXT_JS_TEMPLATE = {
    id: "nextjs-tailwind",
    name: "Next.js + Tailwind CSS",
    description: "Modern web application with App Router, Tailwind CSS, and TypeScript.",
    baseFiles: [
        {
            path: "package.json",
            content: JSON.stringify({
                name: "wadi-nextjs-app",
                version: "0.1.0",
                private: true,
                scripts: {
                    "dev": "next dev",
                    "build": "next build",
                    "start": "next start",
                    "lint": "next lint"
                },
                dependencies: {
                    "react": "^18",
                    "react-dom": "^18",
                    "next": "14.1.0",
                    "tailwindcss": "^3.3.0",
                    "postcss": "^8",
                    "autoprefixer": "^10.0.1"
                },
                devDependencies: {
                    "typescript": "^5",
                    "@types/node": "^20",
                    "@types/react": "^18",
                    "@types/react-dom": "^18",
                    "eslint": "^8",
                    "eslint-config-next": "14.1.0"
                }
            }, null, 2)
        },
        {
            path: "tsconfig.json",
            content: JSON.stringify({
                compilerOptions: {
                    lib: ["dom", "dom.iterable", "esnext"],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: "esnext",
                    moduleResolution: "bundler",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: "preserve",
                    incremental: true,
                    plugins: [{ name: "next" }],
                    paths: { "@/*": ["./src/*"] }
                },
                include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
                exclude: ["node_modules"]
            }, null, 2)
        },
        {
            path: "src/app/layout.tsx",
            content: "import type { Metadata } from \"next\";\nimport \"./globals.css\";\n\nexport const metadata: Metadata = {\n  title: \"WADI Generated App\",\n  description: \"Created with WADI Constructor\",\n};\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}"
        },
        {
            path: "src/app/page.tsx",
            content: "export default function Home() {\n  return (\n    <main className=\"flex min-h-screen flex-col items-center justify-between p-24\">\n      <h1 className=\"text-4xl font-bold\">WADI - Project Materialized</h1>\n      <p>Your Next.js app is ready for development.</p>\n    </main>\n  );\n}"
        },
        {
            path: "src/app/globals.css",
            content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
        }
    ]
};
var VITE_REACT_TEMPLATE = {
    id: "vite-react-ts",
    name: "Vite + React + TS",
    description: "Fast React development with Vite and TypeScript.",
    baseFiles: [
        {
            path: "package.json",
            content: JSON.stringify({
                name: "wadi-vite-app",
                private: true,
                version: "0.0.0",
                type: "module",
                scripts: {
                    "dev": "vite",
                    "build": "tsc && vite build",
                    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
                    "preview": "vite preview"
                },
                dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                },
                devDependencies: {
                    "@types/react": "^18.2.66",
                    "@types/react-dom": "^18.2.22",
                    "@typescript-eslint/eslint-plugin": "^7.2.0",
                    "@typescript-eslint/parser": "^7.2.0",
                    "@vitejs/plugin-react-swc": "^3.5.0",
                    "eslint": "^8.57.0",
                    "eslint-plugin-react-hooks": "^4.6.0",
                    "eslint-plugin-react-refresh": "^0.4.6",
                    "typescript": "^5.2.2",
                    "vite": "^5.2.0"
                }
            }, null, 2)
        },
        {
            path: "tsconfig.json",
            content: JSON.stringify({
                compilerOptions: {
                    target: "ESNext",
                    useDefineForClassFields: true,
                    lib: ["ESNext", "DOM", "DOM.Iterable"],
                    module: "ESNext",
                    skipLibCheck: true,
                    moduleResolution: "bundler",
                    allowImportingTsExtensions: true,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: "react-jsx",
                    strict: true,
                    noUnusedLocals: true,
                    noUnusedParameters: true,
                    noFallthroughCasesInSwitch: true
                },
                include: ["src"]
            }, null, 2)
        },
        {
            path: "src/main.tsx",
            content: "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)"
        },
        {
            path: "src/App.tsx",
            content: "function App() {\n  return (\n    <>\n      <h1>WADI + Vite + React</h1>\n      <p>Fast Materialization Complete.</p>\n    </>\n  )\n}\nexport default App"
        },
        {
            path: "src/index.css",
            content: "body { margin: 0; font-family: sans-serif; }"
        }
    ]
};
var TemplateService = /** @class */ (function () {
    function TemplateService() {
        this.templates = new Map();
        this.templates.set(NEXT_JS_TEMPLATE.id, NEXT_JS_TEMPLATE);
        this.templates.set(VITE_REACT_TEMPLATE.id, VITE_REACT_TEMPLATE);
    }
    TemplateService.prototype.getTemplate = function (id) {
        return this.templates.get(id);
    };
    TemplateService.prototype.listTemplates = function () {
        return Array.from(this.templates.values());
    };
    return TemplateService;
}());
exports.templateService = new TemplateService();
