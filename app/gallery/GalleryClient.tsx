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

export interface GalleryPhoto {
  src: string;
  caption: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: "Campus" | "Academics" | "Sports" | "Events" | "Hostel" | "Faculty" | "Achievements";
  coverImage: string;
  photos: GalleryPhoto[];
}

const ALBUMS_DATA: GalleryAlbum[] = [
  {
    id: "alb-campus",
    title: "Campus Grounds & Academic Infrastructure",
    category: "Campus",
    coverImage: "/images/original/image-1-1.webp",
    photos: [
      {
        src: "/images/original/chatgpt-image-apr-12-2026-09_43_54-pm.webp",
        caption: "Devasthaly Vidyapeeth campus overview in Chilkahar, Ballia",
      },
      {
        src: "/images/original/image-1-1.webp",
        caption: "Academic block surrounded by greenery and tree-lined walkways",
      },
      {
        src: "/images/original/image-3-1.webp",
        caption: "Main school campus and activity area",
      },
      {
        src: "/images/original/image-4-1.webp",
        caption: "Classroom blocks and open courtyards",
      },
    ],
  },
  {
    id: "alb-events",
    title: "Student Activities & Cultural Assemblies",
    category: "Events",
    coverImage: "/images/original/image-5-1.webp",
    photos: [
      {
        src: "/images/original/image-5-1.webp",
        caption: "Annual campus events and academic gatherings",
      },
      {
        src: "/images/original/image-7-1.webp",
        caption: "Student participation in inter-house competitions",
      },
      {
        src: "/images/original/image-8-1.webp",
        caption: "Morning assembly, yoga and cultural celebrations",
      },
      {
        src: "/images/original/dvp8.webp",
        caption: "Annual day cultural performances and felicitation",
      },
    ],
  },
  {
    id: "alb-sports-life",
    title: "Sports, Laboratories & Student Life",
    category: "Sports",
    coverImage: "/images/original/dvp3.webp",
    photos: [
      {
        src: "/images/original/dvp3.webp",
        caption: "Athletics, sports ground tournaments and team races",
      },
      {
        src: "/images/original/dvp4.webp",
        caption: "Assembly and stage presentations",
      },
      {
        src: "/images/original/dvp2.webp",
        caption: "Science laboratories and experimental study practicals",
      },
      {
        src: "/images/original/dvp6.webp",
        caption: "Student club exhibitions and display arenas",
      },
      {
        src: "/images/original/dvp7.webp",
        caption: "Outdoor physical education and campus recreation",
      },
    ],
  },
  {
    id: "alb-alumni",
    title: "Alumni Meet & Reunions",
    category: "Achievements",
    coverImage: "/images/original/ALUMNI-REUNION.webp",
    photos: [
      {
        src: "/images/original/ALUMNI-REUNION.webp",
        caption: "Official Devasthaly Vidyapeeth Alumni Reunion gathering",
      },
    ],
  },
];

const CATEGORIES = ["All", "Campus", "Academics", "Sports", "Events", "Hostel", "Faculty", "Achievements"] as const;

export default function GalleryClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filtered list
  const filteredAlbums = activeCategory === "All"
    ? ALBUMS_DATA
    : ALBUMS_DATA.filter((a) => a.category === activeCategory);

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
      if (e.key === "Escape") {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          handleClose();
        }
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      } else if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAlbum, handleClose, handleNextPhoto, handlePrevPhoto, toggleFullscreen]);

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Life at School / Photo Gallery</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Photo Gallery &amp; Student Life
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Moments of academic rigor, athletic triumph, cultural joy, and student camaraderie captured on our 15-acre green estate in Chilkahar, Ballia.
          </p>

          {/* Category Filter Tabs (UI/UX enhancement) */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#B91C1C] text-white shadow-sm ring-2 ring-[#B91C1C]/30"
                      : "bg-[#F3F4F6] text-gray-600 hover:text-[#111827] hover:bg-gray-200/80 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="site-container space-y-10">

        {/* Gallery Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => handleOpenAlbum(album)}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer border border-gray-200/90 hover:border-red-300"
            >
              <div>
                {/* Image Visual Container */}
                <div className="relative w-full aspect-[16/10] bg-[#111827] overflow-hidden">
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Photo Count Badge */}
                  <span className="absolute bottom-2.5 right-2.5 text-sm bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-full text-white font-semibold flex items-center gap-1 shadow-sm border border-white/10">
                    <Camera className="w-3 h-3 text-[#F4CD13]" />
                    <span>{album.photos.length} Photos</span>
                  </span>

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 text-sm font-bold uppercase tracking-wider text-white bg-[#B91C1C] px-2.5 py-0.5 rounded-full shadow-sm">
                    {album.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#111827] group-hover:text-[#B91C1C] transition-colors line-clamp-2 leading-snug">
                    {album.title}
                  </h3>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-[#B91C1C] group-hover:translate-x-1 transition-transform">
                <span>View Full Album</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          LIGHTBOX / GALLERY MODAL (With Full-Screen View Option)
      ========================================================================= */}
      {selectedAlbum && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 ${
            isFullscreen ? "p-2 sm:p-4" : "p-3 sm:p-6"
          }`}
          onClick={(e) => {
            // Close when clicking directly on backdrop
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          {/* Top Bar / Header */}
          <div
            className={`flex items-center justify-between w-full mx-auto text-white pb-3 sm:pb-4 border-b border-white/10 transition-all duration-300 ${
              isFullscreen ? "max-w-7xl px-2" : "max-w-5xl"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <span className="text-sm font-bold uppercase tracking-wider bg-[#B91C1C] text-white px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                {selectedAlbum.category}
              </span>
              <h2 className="font-heading font-bold text-sm sm:text-base text-white truncate">
                {selectedAlbum.title}
              </h2>
              <span className="text-sm text-gray-400 hidden sm:inline-block">
                • Photo {activePhotoIdx + 1} of {selectedAlbum.photos.length}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen View" : "Enter Fullscreen View"}
                title={isFullscreen ? "Exit Fullscreen (F)" : "Full Screen View (F)"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer border border-white/15 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#F4CD13]" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#F4CD13]" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </button>

              <span className="text-sm text-gray-400 hidden md:inline-block bg-white/5 border border-white/10 px-2 py-1 rounded">
                Esc to close
              </span>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close photo gallery modal"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Visual Stage with Left/Right Arrows */}
          <div
            className={`relative w-full mx-auto flex items-center justify-center my-auto py-2 transition-all duration-300 ${
              isFullscreen ? "max-w-7xl" : "max-w-5xl"
            }`}
          >
            {/* Left Nav Button */}
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Previous photograph"
              className="absolute left-1 sm:left-3 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Active Photograph */}
            <div
              className={`relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black/60 border border-white/10 flex items-center justify-center transition-all duration-300 ${
                isFullscreen
                  ? "h-[70vh] sm:h-[78vh] max-h-none"
                  : "h-[50vh] sm:h-[60vh] max-h-[620px]"
              }`}
            >
              <Image
                key={selectedAlbum.photos[activePhotoIdx].src}
                src={selectedAlbum.photos[activePhotoIdx].src}
                alt={selectedAlbum.photos[activePhotoIdx].caption}
                fill
                sizes="(max-width: 1536px) 100vw, 1500px"
                className="object-contain"
                priority
              />

              {/* In-Canvas Fullscreen Quick Icon (Top-Right) */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Full Screen View"}
                title={isFullscreen ? "Exit Fullscreen (F)" : "Full Screen View (F)"}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white transition-all cursor-pointer border border-white/15 backdrop-blur-xs shadow-md"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#F4CD13]" /> : <Maximize2 className="w-4 h-4 text-[#F4CD13]" />}
              </button>

              {/* Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 sm:p-5 text-white z-10 flex items-center justify-between gap-4">
                <p className="text-base font-medium text-white/95 leading-relaxed">
                  {selectedAlbum.photos[activePhotoIdx].caption}
                </p>
                <span className="text-sm text-gray-300 font-semibold shrink-0 sm:hidden">
                  {activePhotoIdx + 1}/{selectedAlbum.photos.length}
                </span>
              </div>
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next photograph"
              className="absolute right-1 sm:right-3 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div
            className={`w-full mx-auto pt-3 border-t border-white/10 transition-all duration-300 ${
              isFullscreen ? "max-w-7xl px-2" : "max-w-5xl"
            }`}
          >
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
              {selectedAlbum.photos.map((photo, pIdx) => {
                const isActive = pIdx === activePhotoIdx;
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActivePhotoIdx(pIdx)}
                    aria-label={`Jump to photo ${pIdx + 1}`}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border ${
                      isActive
                        ? "ring-2 ring-[#B91C1C] border-white scale-105 opacity-100 shadow-md"
                        : "border-white/20 opacity-40 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={`Thumbnail ${pIdx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
