"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const processRoute_1 = __importDefault(require("./routes/processRoute"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares globais
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express_1.default.json());
// Rotas
app.use("/api", processRoute_1.default);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Middleware de tratamento de erros global
app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err.message);
    res.status(500).json({
        error: err.message || "Erro interno do servidor.",
    });
});
app.listen(PORT, () => {
    console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
exports.default = app;
