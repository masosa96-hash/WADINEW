"use strict";
/**
 * WADI Internal Event Bus — Phase 15B
 *
 * Typed publish/subscribe bus for decoupling WADI's three layers:
 *   Core Cognitive  ──emit──▶ Engine (materializer, tools)
 *   Engine          ──emit──▶ Infra  (deploy, metrics)
 *
 * Rules:
 *   - Core does NOT import Engine or Infra directly.
 *   - Engine does NOT import Core prompts or user context.
 *   - Events are the ONLY bridge between layers.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
var events_1 = require("events");
// ─── Typed Bus ────────────────────────────────────────────────────────────────
var WadiEventBus = /** @class */ (function (_super) {
    __extends(WadiEventBus, _super);
    function WadiEventBus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WadiEventBus.prototype.emit = function (event, payload) {
        return _super.prototype.emit.call(this, event, payload);
    };
    WadiEventBus.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    WadiEventBus.prototype.once = function (event, listener) {
        return _super.prototype.once.call(this, event, listener);
    };
    WadiEventBus.prototype.off = function (event, listener) {
        return _super.prototype.off.call(this, event, listener);
    };
    return WadiEventBus;
}(events_1.EventEmitter));
exports.eventBus = new WadiEventBus();
// Unlimited listeners: each layer subscribes independently
exports.eventBus.setMaxListeners(50);
