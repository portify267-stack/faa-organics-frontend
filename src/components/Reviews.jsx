import React, { useState, useEffect, useRef } from 'react';
import { reviews } from '../data/reviews';

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 6000);
  };

  const stopAutoPlay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
    startAutoPlay();
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % reviews.length);
    startAutoPlay();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Real Stories</span>
          <h2 className="section-title">Loved by Delicate Skin</h2>
          <p className="section-desc">Here is what our community says about their transformation with FAA Organics.</p>
        </div>

        <div className="slider-outer-wrapper">
          <div className="slider-viewport" id="reviews-viewport">
            <div
              className="slider-track"
              id="reviews-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
            >
              {reviews.map(review => (
                <article key={review.id} className="review-card">
                  <div className="review-stars" aria-label="5 stars rating">★★★★★</div>
                  <blockquote className="review-quote">
                    "{review.quote}"
                  </blockquote>
                  <cite className="review-author">{review.author}</cite>
                </article>
              ))}
            </div>
          </div>

          <div className="slider-controls">
            <button
              type="button"
              className="slider-arrow prev"
              id="slider-prev"
              aria-label="Previous testimonial"
              onClick={handlePrev}
            >
              &#8592;
            </button>
            <div className="slider-dots" id="slider-dots">
              {reviews.map((_, i) => (
                <span
                  key={i}
                  className={`slider-dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to testimonial slide ${i + 1}`}
                ></span>
              ))}
            </div>
            <button
              type="button"
              className="slider-arrow next"
              id="slider-next"
              aria-label="Next testimonial"
              onClick={handleNext}
            >
              &#8594;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

