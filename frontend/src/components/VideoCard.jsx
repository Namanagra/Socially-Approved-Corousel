import { useRef, useState, useCallback, memo } from "react";
import { useVideoObserver } from "../hooks/useVideoObserver";
import { likeVideo, shareVideo } from "../api/videos";
import "./VideoCard.css";

const VideoCard = memo(function VideoCard({ video, isActive }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes ?? 0);
  const [shared, setShared] = useState(false);
  const [shareCount, setShareCount] = useState(video.shares ?? 0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useVideoObserver(videoRef, { threshold: 0.7 });

  const handlePlay = () => setPlaying(true);
  const handlePause = () => setPlaying(false);
  const handleWaiting = () => setLoading(true);
  const handleCanPlay = () => setLoading(false);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleLike = useCallback(async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      await likeVideo(video.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }, [liked, video.id]);

  const handleShare = useCallback(async (platform = "copy") => {
    const url = `${window.location.origin}/video/${video.id}`;
    if (platform === "native" && navigator.share) {
      await navigator.share({ title: video.title, url });
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
    } else if (platform === "instagram") {
      await navigator.clipboard.writeText(url);
      alert("Link copied! Paste it on Instagram.");
    } else {
      await navigator.clipboard.writeText(url);
    }
    setShared(true);
    setShareCount((c) => c + 1);
    setShowShareMenu(false);
    try {
      await shareVideo(video.id, platform);
    } catch {
    }
  }, [video.id, video.title]);

  const R = 16;
  const circ = 2 * Math.PI * R;
  const dashoffset = circ - (progress / 100) * circ;

  return (
    <div className="video-card">
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="video-el"
      />

      {loading && (
        <div className="spinner-wrap" aria-label="Loading video">
          <div className="spinner" />
        </div>
      )}

      {!loading && !playing && (
        <div className="play-overlay" onClick={togglePlay}>
          <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="28" fill="rgba(0,0,0,0.45)" />
            <polygon points="22,16 44,28 22,40" fill="white" />
          </svg>
        </div>
      )}

      <div className="card-overlay">
        <div className="meta">
          <p className="video-title">{video.title}</p>
          <p className="video-desc">{video.description}</p>
        </div>

        <div className="controls">
          <button className="ctrl-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          {/* Like */}
          <button className={`ctrl-btn like-btn${liked ? " liked" : ""}`} onClick={handleLike} aria-label="Like">
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#ff4d6d" : "none"} stroke={liked ? "#ff4d6d" : "white"} strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="ctrl-count">{likeCount}</span>
          </button>

          {/* Share */}
          <div className="share-wrap">
            <button className={`ctrl-btn${shared ? " shared" : ""}`} onClick={() => setShowShareMenu((v) => !v)} aria-label="Share">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={shared ? "#4ade80" : "white"} strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="ctrl-count">{shareCount}</span>
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare("copy")}>📋 Copy link</button>
                <button onClick={() => handleShare("whatsapp")}>💬 WhatsApp</button>
                <button onClick={() => handleShare("instagram")}>📸 Instagram</button>
                {navigator.share && <button onClick={() => handleShare("native")}>↗ More</button>}
              </div>
            )}
          </div>

          {/* Circular progress ring */}
          <svg className="progress-ring" width="40" height="40" aria-label={`${Math.round(progress)}% played`}>
            <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            <circle
              cx="20" cy="20" r={R}
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeDasharray={circ}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default VideoCard;
