"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.75;
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-gray-50"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5 text-charcoal" />
      </button>

      {/* Scrollable track */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-gray-50"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5 text-charcoal" />
      </button>
    </div>
  );
}
