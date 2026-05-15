import { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/virtual";
import "./OuterCarousel.css";


export default function OuterCarousel({ videos, onVideoClick }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleClick = useCallback(
    (idx) => {
      onVideoClick(idx);
    },
    [onVideoClick]
  );

  if (!videos.length) {
    return (
      <div className="outer-skeleton-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="outer-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <section className="outer-carousel">
      <h2 className="section-title">BoreDom</h2>

      <Swiper
        modules={[Virtual, FreeMode]}
        virtual
        freeMode
        slidesPerView={2.3}
        spaceBetween={10}
        breakpoints={{
          480: { slidesPerView: 3.2, spaceBetween: 12 },
          768: { slidesPerView: 4.2, spaceBetween: 14 },
          1024: { slidesPerView: 5.5, spaceBetween: 16 },
        }}
        className="outer-swiper"
      >
        {videos.map((video, idx) => (
          <SwiperSlide key={video.id} virtualIndex={idx}>
            <div
              className={`thumb-card${hoveredIdx === idx ? " hovered" : ""}`}
              onClick={() => handleClick(idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick(idx)}
              aria-label={`Play ${video.title}`}
            >
              { }
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="thumb-img"
                decoding="async"
              />

              <div className="thumb-overlay">
                <div className="play-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.55)" />
                    <polygon points="13,10 24,16 13,22" fill="white" />
                  </svg>
                </div>
              </div>

              <div className="thumb-caption">
                <p className="thumb-title">{video.title}</p>
                <p className="thumb-likes">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4d6d" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {video.likes ?? 0}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
