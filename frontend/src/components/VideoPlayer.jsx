import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useAuth } from '../contexts/AuthContext';
import { saveProgress } from '../services/api';

export default function VideoPlayer({ lesson }) {
  const videoRef = useRef(null);
  const { getAccessToken } = useAuth();
  const [lastSaved, setLastSaved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- HLS & Source Handling ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lesson) return;

    setIsLoading(true); // Reset loading on lesson change

    const src = lesson.video_url;
    if (!src) return;

    let hls;
    if (Hls.isSupported() && src.endsWith('.m3u8')) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false); // Ready to play
      });
    } else {
      video.src = src;
      video.onloadeddata = () => setIsLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [lesson]);

  // --- Progress Tracking Logic (Unchanged) ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lesson) return;

    const handleTimeUpdate = async () => {
      const current = Math.floor(video.currentTime);
      if (current - lastSaved >= 15) {
        try {
          await saveProgress(getAccessToken(), lesson._id || lesson.id, current, false);
          setLastSaved(current);
        } catch (err) { console.error('save progress', err); }
      }
    };

    const handleEnded = async () => {
      try { 
        await saveProgress(getAccessToken(), lesson._id || lesson.id, Math.floor(video.duration || 0), true); 
      } catch (err) { console.error(err); }
    };

    // Listen for buffering events to show spinner
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [lesson, lastSaved, getAccessToken]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group shadow-2xl">
      
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      <video 
        ref={videoRef} 
        controls 
        className="w-full h-full object-contain"
        controlsList="nodownload" 
      />
    </div>
  );
}