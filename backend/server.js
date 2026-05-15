const express = require("express");
const cors = require("cors");
const path = require("path");

const videoRoutes = require("./routes/videos");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.use("/api/videos", videoRoutes);

app.use("/api/like", videoRoutes);

app.use("/api/share", videoRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});


app.listen(PORT, () => {
    console.log(`\n✅ Backend running at http://localhost:${PORT}`);
    console.log(`   GET  http://localhost:${PORT}/api/videos`);
    console.log(`   POST http://localhost:${PORT}/api/like`);
    console.log(`   POST http://localhost:${PORT}/api/share`);
    console.log(`   GET  http://localhost:${PORT}/api/health\n`);
});