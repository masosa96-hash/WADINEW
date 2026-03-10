"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: "../../.env" });
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
        var visibleKeys = Object.keys(process.env).filter(function (k) { return k.startsWith("SUPABASE") || k.includes("URL") || k.includes("KEY"); });
        console.error("FATAL: Missing Supabase credentials in production.");
        console.error("Available related keys:", visibleKeys);
        console.error("SUPABASE_URL present:", !!supabaseUrl);
        console.error("SUPABASE_KEY (resolved) present:", !!supabaseKey);
        throw new Error("FATAL: Missing SUPABASE_URL (".concat(!!supabaseUrl, ") or SUPABASE_KEY/ANON_KEY/SERVICE_ROLE_KEY (").concat(!!supabaseKey, ") in production."));
    }
    console.warn("⚠️ Missing Supabase URL or Key. functionality will be limited.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");
