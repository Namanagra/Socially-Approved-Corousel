import { useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/virtual";
import VideoCard from "./VideoCard";
import "./InnerSlider.css";

export default function InnerSlider({ videos, startIndex, onClose }) {
    const swiperRef = useRef(null);
    const activeIdxRef = useRef(startIndex);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);


    const handleSlideChange = useCallback((swiper) => {
        activeIdxRef.current = swiper.activeIndex;
        const BUFFER = 2;

        swiper.slides.forEach((slide, i) => {
            const video = slide.querySelector("video");
            if (!video) return;
            const dist = Math.abs(i - swiper.activeIndex);
            if (dist > BUFFER) {
                if (video.src) {
                    video.pause();
                    video.removeAttribute("src");
                    video.load();
                }
            } else {
                const originalSrc = videos[i]?.videoUrl;
                if (originalSrc && !video.src) {
                    video.src = originalSrc;
                    video.load();
                }
            }
        });
    }, [videos]);

    return (
        <div className="inner-slider-backdrop" role="dialog" aria-modal="true" aria-label="Video player">
            <button className="close-btn" onClick={onClose} aria-label="Close video player">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div className="video-counter" aria-live="polite">
                <span id="counter-text">{startIndex + 1} / {videos.length}</span>
            </div>

            <Swiper
                ref={swiperRef}
                modules={[Virtual, Keyboard]}
                direction="vertical"
                virtual
                keyboard={{ enabled: true }}
                initialSlide={startIndex}
                slidesPerView={1}
                className="inner-swiper"
                onSlideChange={(swiper) => {
                    handleSlideChange(swiper);
                    const counter = document.getElementById("counter-text");
                    if (counter) counter.textContent = `${swiper.activeIndex + 1} / ${videos.length}`;
                }}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
            >
                {videos.map((video, idx) => (
                    <SwiperSlide key={video.id} virtualIndex={idx}>
                        <div className="slide-wrap">
                            <VideoCard
                                video={video}
                                isActive={idx === startIndex}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
