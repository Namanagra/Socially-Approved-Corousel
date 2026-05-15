import { useEffect, useRef } from "react";

/**
 * useVideoObserver
 * Attaches an IntersectionObserver to a <video> ref.
 * - Plays when >= threshold% visible
 * - Pauses (and resets) when out of view
 */
export function useVideoObserver(videoRef, { threshold = 0.7, resetOnHide = true } = {}) {
  const observerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked — browser requires muted or user gesture
          });
        } else {
          video.pause();
          if (resetOnHide) video.currentTime = 0;
        }
      },
      { threshold }
    );

    observerRef.current.observe(video);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videoRef, threshold, resetOnHide]);
}