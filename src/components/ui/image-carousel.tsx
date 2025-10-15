"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageCarousel({
  images,
  alt = "Image",
  className,
  aspectRatio = "video"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video",
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          ?
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn(
        "relative overflow-hidden",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video",
        className
      )}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={cn(
      "relative group overflow-hidden",
      aspectRatio === "square" && "aspect-square",
      aspectRatio === "video" && "aspect-video",
      className
    )}>
      {/* Imagen principal */}
      <Image
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
      />

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicadores de puntos */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                index === currentIndex 
                  ? "bg-white" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}
