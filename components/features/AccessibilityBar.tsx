"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Contrast, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccessibilityBar() {
  const [zoomLevel, setZoomLevel] = useState(90); // Default to 90% on first load
  const [highContrast, setHighContrast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply zoom
    document.documentElement.style.fontSize = `${zoomLevel}%`;
    
    // Apply contrast
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Save preferences
    localStorage.setItem("accessibility-zoom", zoomLevel.toString());
    localStorage.setItem("accessibility-contrast", highContrast.toString());
  }, [zoomLevel, highContrast]);

  useEffect(() => {
    // Load saved preferences, or use 90% as default on first load
    const savedZoom = localStorage.getItem("accessibility-zoom");
    const savedContrast = localStorage.getItem("accessibility-contrast");
    
    if (savedZoom) {
      setZoomLevel(Number(savedZoom));
    } else {
      // First load - set to 90% and apply immediately
      const initialZoom = 90;
      setZoomLevel(initialZoom);
      document.documentElement.style.fontSize = `${initialZoom}%`;
      localStorage.setItem("accessibility-zoom", initialZoom.toString());
    }
    if (savedContrast === "true") {
      setHighContrast(true);
    }
  }, []);

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => Math.min(prev + 10, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => Math.max(prev - 10, 50));
    }
  };

  const toggleContrast = () => {
    setHighContrast(prev => !prev);
  };

  return (
    <>
      {/* Toggle Button - Repositioned to bottom-left to avoid covering logo */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-primary-500 text-white rounded-full shadow-large flex items-center justify-center hover:bg-primary-600 transition-colors"
        aria-label="Accessibility options"
      >
        <Contrast size={20} />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 z-50 bg-white rounded-xl shadow-2xl border border-secondary-200 p-4 min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary-700">Accessibility</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-secondary-100 rounded p-1 transition-colors"
                aria-label="Close accessibility panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Zoom: {zoomLevel}%
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-secondary-300 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <div className="flex-1 h-2 bg-secondary-200 rounded-full relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${((zoomLevel - 50) / 150) * 100}%` }}
                  />
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-secondary-300 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Contrast Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={toggleContrast}
                  className="w-5 h-5 text-primary-500 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-semibold text-text-primary">High Contrast</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

