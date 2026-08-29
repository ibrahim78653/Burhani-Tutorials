import { useEffect } from 'react';
import './Lightbox.css';

export default function Lightbox({ isOpen, images, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const current = images[currentIndex] || images[0];

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image Preview">
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Controls */}
        <div className="lightbox-header">
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="lightbox-title-wrap">
            <h3 className="lightbox-img-title">{current.title}</h3>
            {current.category && <span className="lightbox-category-badge">{current.category}</span>}
          </div>
          <button className="lightbox-close-btn" onClick={onClose} aria-label="Close Lightbox">
            ✕
          </button>
        </div>

        {/* Main Image Area */}
        <div className="lightbox-body">
          {images.length > 1 && (
            <button className="lightbox-nav-btn prev" onClick={onPrev} aria-label="Previous Image">
              ‹
            </button>
          )}

          <div className="lightbox-image-wrapper">
            <img
              src={current.image}
              alt={current.title || 'Burhani Tutorials photo'}
              className="lightbox-image"
              loading="eager"
            />
          </div>

          {images.length > 1 && (
            <button className="lightbox-nav-btn next" onClick={onNext} aria-label="Next Image">
              ›
            </button>
          )}
        </div>

        {/* Caption */}
        {current.caption && (
          <div className="lightbox-footer">
            <p className="lightbox-caption">{current.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
