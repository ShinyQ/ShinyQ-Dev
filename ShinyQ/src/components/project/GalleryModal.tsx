'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface GalleryImage {
  src: string;
  alt?: string;
}

interface GalleryModalProps {
  images: GalleryImage[];
  open: boolean;
  startIndex?: number;
  onClose: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ images = [], open, startIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(Math.min(startIndex, images.length - 1));

  useEffect(() => {
    if (open) {
      const validIndex = Math.min(startIndex, images.length - 1);
      setCurrent(validIndex);
    }
  }, [open, startIndex, images.length]);

  const showPrev = useCallback(() => {
    if (images.length <= 1) {
      return;
    }

    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    if (images.length <= 1) {
      return;
    }

    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'ArrowLeft') {
        showPrev();
      }

      if (e.key === 'ArrowRight') {
        showNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, showPrev, showNext]);

  if (!open || !images?.length) {
    return null;
  }

  const currentImage = images[current];
  if (!currentImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label="Gallery"
    >
      <button
        type="button"
        aria-label="Close"
        className="fixed top-6 right-6 text-white text-2xl font-bold bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 z-50"
        onClick={onClose}
      >
        &times;
      </button>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-2xl font-bold bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 z-50"
              onClick={showPrev}
            >
              &#8592;
            </button>
            <button
              type="button"
              aria-label="Next"
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-2xl font-bold bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 z-50"
              onClick={showNext}
            >
              &#8594;
            </button>
          </>
        )}
        <img
          src={currentImage.src}
          alt={currentImage.alt ?? 'Project image'}
          className="w-[900px] max-h-[80vh] h-auto rounded-lg shadow-lg border border-border bg-background mx-auto block"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "/placeholder.svg";
          }}
        />
        {images.length > 1 && (
          <div className="text-center text-white mt-2 text-sm">
            {current + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryModal; 