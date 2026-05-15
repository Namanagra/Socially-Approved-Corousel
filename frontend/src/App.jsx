import { useState, useEffect, useCallback } from "react";
import OuterCarousel from "./components/OuterCarousel";
import InnerSlider from "./components/InnerSlider";
import { fetchVideos } from "./api/videos";
import "./App.css";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch all videos on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchVideos();
        if (!cancelled) setVideos(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load videos. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleVideoClick = useCallback((idx) => {
    setActiveIndex(idx);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  if (error) {
    return (
      <div className="app-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <OuterCarousel
        videos={loading ? [] : videos}
        onVideoClick={handleVideoClick}
      />

      {modalOpen && (
        <InnerSlider
          videos={videos}
          startIndex={activeIndex}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
