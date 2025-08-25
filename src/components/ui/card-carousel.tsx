"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { X, Maximize, Minimize } from "lucide-react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Button } from "@/components/ui/button"

interface CloudinaryImage {
  asset_id: string
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  alt?: string
}

interface CarouselProps {
  images: CloudinaryImage[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  onClose?: () => void
}

export const FullScreenCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoopEnabled, setIsLoopEnabled] = useState(true)

  // Check if we have enough slides for loop (Swiper requires min 4 slides for loop)
  useEffect(() => {
    setIsLoopEnabled(images.length >= 4)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen()
        }
        onClose?.()
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isFullscreen, onClose])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const css = `
  .swiper {
    width: 100%;
    height: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: contain;
    width: 80%;
    max-width: 800px;
    height: 80vh;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .swiper-3d .swiper-slide-shadow-left,
  .swiper-3d .swiper-slide-shadow-right {
    background: none;
  }

  .fullscreen-carousel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    gap: 10px;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  /* Custom navigation arrows */
  .custom-next, .custom-prev {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .custom-next:hover, .custom-prev:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }
  
  .custom-next { right: 20px; }
  .custom-prev { left: 20px; }

  /* Hide navigation when disabled */
  .swiper-button-disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: translateY(-50%) scale(1);
  }
  
  .swiper-button-disabled:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%) scale(1);
  }
  `

  // If no images, don't render anything
  if (images.length === 0) {
    return null
  }

  return (
    <div className="fullscreen-carousel">
      <style>{css}</style>
      
      {/* Controls */}
      <div className="carousel-controls">
        <Button
          variant="ghost"
          size="icon"
          className="control-btn"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="control-btn"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

      {/* Carousel Content */}
      <div className="w-full h-full max-w-7xl mx-auto p-8">
        <div className="relative w-full h-full flex items-center justify-center">
          <Swiper
            spaceBetween={30}
            autoplay={{
              delay: autoplayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            loop={isLoopEnabled} // Only enable loop if we have enough slides
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false, // Disable shadows for better performance
            }}
            pagination={{
              enabled: showPagination && images.length > 1,
              clickable: true,
              dynamicBullets: images.length > 5,
            }}
            navigation={showNavigation}
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
            className="w-full h-full"
            // Better handling for few slides
            resistanceRatio={0}
            touchRatio={1}
            shortSwipes={true}
          >
            {images.map((image) => (
              <SwiperSlide key={image.asset_id}>
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={image.secure_url}
                    width={image.width}
                    height={image.height}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    alt={image.alt || `Image`}
                    quality={100}
                    loading="eager"
                    priority={true}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Custom Navigation Arrows - Only show if we have multiple images */}
      {showNavigation && images.length > 1 && (
        <>
          <div className="custom-next control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="custom-prev control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </>
      )}
    </div>
  )
}