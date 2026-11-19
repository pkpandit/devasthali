"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { GALLERY_ALBUMS as ALBUMS_DATA } from "@/lib/content/gallery";
import type { GalleryPhoto, GalleryAlbum } from "@/types/content";
export type { GalleryPhoto, GalleryAlbum };

const CATEGORIES = ["All", "Campus", "Academics", "Sports", "Events", "Hostel", "Faculty", "Achievements"] as const;

interface GalleryClientProps {
  initialAlbums?: GalleryAlbum[];
}

export default function GalleryClient({ initialAlbums }: GalleryClientProps = {}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const albums = initialAlbums ?? ALBUMS_DATA;

  // Filtered list
  const filteredAlbums = activeCategory === "All"
    ? albums
    : albums.filter((a) => a.category === activeCategory);

  // Open modal
  const handleOpenAlbum = (album: GalleryAlbum, startIdx = 0) => {
    setSelectedAlbum(album);
    setActivePhotoIdx(startIdx);
    setIsFullscreen(false);
  };

  // Close modal
  const handleClose = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    setSelectedAlbum(null);
    setActivePhotoIdx(0);
  }, []);

  // Toggle Fullscreen (Native API + fallback state)
  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;

    if (!document.fullscreenElement) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {
          setIsFullscreen((prev) => !prev);
        });
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  // Listen to fullscreen changes from browser (e.g. user pressed Esc to exit fullscreen)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Next / Prev photo
  const handleNextPhoto = useCallback(() => {
    if (!selectedAlbum) return;
    setActivePhotoIdx((prev) => (prev + 1) % selectedAlbum.photos.length);
  }, [selectedAlbum]);

  const handlePrevPhoto = useCallback(() => {
    if (!selectedAlbum) return;
    setActivePhotoIdx((prev) => (prev - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
  }, [selectedAlbum]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!selectedAlbum) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedAlbum, handleClose, handleNextPhoto, handlePrevPhoto]);

  return (
    <div className="w-full bg-[#F3F4F6] min-h-screen pb-24">
      {/* 1. Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-8 sm:mb-12 shadow-2xs">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>Campus Gallery</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Life at Devasthaly in Pictures
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-2xl font-sans">
            Explore glimpses of our 15-acre lush green campus, state-of-the-art laboratories, co-curricular celebrations, and everyday learning moments.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-6">
            {CATEGORIES.map((cat) => {
              const count = cat === "All"
                ? albums.length
                : albums.filter((a) => a.category === cat).length;
              if (cat !== "All" && count === 0) return null;

              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all ${
                    isActive
                      ? "bg-[#B91C1C] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                  <span className={`ml-1.5 text-xs ${isActive ? "text-red-200" : "text-gray-600"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Albums Grid Section */}
      <div className="site-container">
        {filteredAlbums.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-heading font-bold text-gray-700">No albums in this category</h3>
            <p className="text-sm text-gray-500 mt-1">Please select another category above to view albums.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Album Cover with Click Action */}
                <div
                  className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => handleOpenAlbum(album, 0)}
                >
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-white/95 text-[#B91C1C] backdrop-blur-xs shadow-xs">
                      {album.category}
                    </span>
                  </div>

                  {/* Photo Count Badge */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-black/60 text-white backdrop-blur-xs">
                    <Layers className="w-3.5 h-3.5 text-white/80" />
                    <span>{album.photos.length} Photos</span>
                  </div>

                  {/* Title on Image Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <h2 className="font-heading text-lg sm:text-xl font-bold leading-snug drop-shadow-xs">
                      {album.title}
                    </h2>
                  </div>
                </div>

                {/* Thumbnail Strip preview (First 4 photos) */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {album.photos.slice(0, 4).map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className="relative h-16 sm:h-20 rounded-lg overflow-hidden bg-gray-100 cursor-pointer border border-transparent hover:border-[#B91C1C] transition-all"
                        onClick={() => handleOpenAlbum(album, pIdx)}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.caption || `${album.title} photo ${pIdx + 1}`}
                          fill
                          sizes="(max-width: 768px) 25vw, 150px"
                          className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                        {pIdx === 3 && album.photos.length > 4 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-heading font-bold">
                            +{album.photos.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* View Album Button */}
                  <button
                    onClick={() => handleOpenAlbum(album, 0)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-800 hover:text-[#B91C1C] text-sm font-heading font-bold transition-all border border-gray-200/80 hover:border-red-200"
                  >
                    <span>View Full Album ({album.photos.length} Photos)</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Lightbox Modal */}
      {selectedAlbum && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-xs select-none"
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black/40 text-white border-b border-white/10 z-20">
            <div>
              <span className="text-xs uppercase font-heading font-bold tracking-wider text-red-400">
                {selectedAlbum.category}
              </span>
              <h2 className="text-sm sm:text-base font-heading font-bold line-clamp-1">
                {selectedAlbum.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-gray-400 font-sans">
                {activePhotoIdx + 1} of {selectedAlbum.photos.length}
              </span>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewing Area */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
            {/* Previous Button */}
            {selectedAlbum.photos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Current Active Photo */}
            <div className="relative w-full h-full max-w-5xl max-h-[70vh] sm:max-h-[75vh] flex items-center justify-center">
              <Image
                src={selectedAlbum.photos[activePhotoIdx].src}
                alt={selectedAlbum.photos[activePhotoIdx].caption || selectedAlbum.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
                priority
              />
            </div>

            {/* Next Button */}
            {selectedAlbum.photos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Caption & Thumbnail Filmstrip Bottom Bar */}
          <div className="bg-black/70 border-t border-white/10 px-4 py-3 sm:py-4 z-20">
            {/* Caption Text */}
            <p className="text-center text-xs sm:text-sm text-gray-300 max-w-3xl mx-auto mb-3 font-sans line-clamp-2">
              {selectedAlbum.photos[activePhotoIdx].caption}
            </p>

            {/* Thumbnail Filmstrip */}
            {selectedAlbum.photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto scrollbar-none">
                {selectedAlbum.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-12 h-10 sm:w-16 sm:h-12 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                      activePhotoIdx === idx
                        ? "border-[#B91C1C] scale-105"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={p.src}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
