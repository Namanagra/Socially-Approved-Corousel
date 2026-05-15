const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../data/videos.json");


function readVideos() {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
}

function writeVideos(videos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2), "utf-8");
}

const likeTracker = {};

const shareTracker = {};


router.get("/", (req, res) => {
    try {
        const videos = readVideos();
        res.json(videos);
    } catch (err) {
        console.error("GET /videos error:", err.message);
        res.status(500).json({ error: "Could not load videos" });
    }
});


router.post("/like", (req, res) => {
    const { videoId, userId } = req.body;

    if (!videoId || !userId) {
        return res.status(400).json({ error: "videoId and userId are required" });
    }

    try {
        const videos = readVideos();
        const idx = videos.findIndex((v) => v.id === videoId);

        if (idx === -1) {
            return res.status(404).json({ error: "Video not found" });
        }

        if (!likeTracker[videoId]) {
            likeTracker[videoId] = new Set();
        }

        const alreadyLiked = likeTracker[videoId].has(userId);

        if (alreadyLiked) {
            likeTracker[videoId].delete(userId);
            videos[idx].likes = Math.max(0, (videos[idx].likes || 0) - 1);
        } else {
            likeTracker[videoId].add(userId);
            videos[idx].likes = (videos[idx].likes || 0) + 1;
        }

        writeVideos(videos);

        res.json({
            videoId,
            likes: videos[idx].likes,
            liked: !alreadyLiked,
            success: true
        });
    } catch (err) {
        console.error("POST /like error:", err.message);
        res.status(500).json({ error: "Could not update like" });
    }
});


router.post("/share", (req, res) => {
    const { videoId, platform = "copy" } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: "videoId is required" });
    }

    try {
        const videos = readVideos();
        const idx = videos.findIndex((v) => v.id === videoId);

        if (idx === -1) {
            return res.status(404).json({ error: "Video not found" });
        }

        if (!shareTracker[videoId]) {
            shareTracker[videoId] = {};
        }
        shareTracker[videoId][platform] = (shareTracker[videoId][platform] || 0) + 1;

        videos[idx].shares = (videos[idx].shares || 0) + 1;
        writeVideos(videos);

        res.json({
            videoId,
            platform,
            shares: videos[idx].shares,
            breakdown: shareTracker[videoId],
        });
    } catch (err) {
        console.error("POST /share error:", err.message);
        res.status(500).json({ error: "Could not track share" });
    }
});


module.exports = router;
