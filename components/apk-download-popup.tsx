"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApkDownloadPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the popup
    const lastClosed = localStorage.getItem("apkPopupClosed");
    if (lastClosed) {
      const hoursSinceClosed = (Date.now() - parseInt(lastClosed)) / (1000 * 60 * 60);
      if (hoursSinceClosed < 24) {
        return; // Don't show if closed within 24 hours
      }
    }

    // Slight delay so it doesn't immediately interrupt page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem("apkPopupClosed", Date.now().toString());
  };

  if (!isVisible) return null;

  // The latest APK GitHub release endpoint based on your repository remote URL
  const downloadUrl = "https://github.com/Stranger1298/teacher-attendance-system--1-/releases/latest/download/app-debug.apk";

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border shadow-lg rounded-xl p-4 z-50 flex gap-4 items-start animate-in slide-in-from-bottom-5">
      <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0 flex items-center justify-center">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 pt-1">
        <h3 className="font-semibold text-[15px] leading-tight">Get the Android App</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          Download the latest TeacherHQ Android app for a better native experience.
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="w-full font-medium shadow-sm">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" onClick={closePopup}>
              Download APK
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={closePopup} className="px-3 shrink-0">
            Dismiss
          </Button>
        </div>
      </div>
      <button
        onClick={closePopup}
        className="text-muted-foreground hover:bg-accent p-1 rounded-full shrink-0 transition-colors absolute top-2 right-2"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
