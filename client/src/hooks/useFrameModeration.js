import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Intelligent browser-side frame analysis hook:
 * - Detects black screens / covered cameras (with tape, fingers, or disabled sensor).
 * - Triggers an automated countdown to auto-skip/stop the call if black screen persists.
 * - Heuristic skin-exposure safety detection with smart privacy blur.
 */
export const useFrameModeration = (videoElementRef, isEnabled = true, onAutoSkip = null) => {
  const [isFlagged, setIsFlagged] = useState(false);
  const [safetyScore, setSafetyScore] = useState(100);
  const [isBlurActive, setIsBlurActive] = useState(false);
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [blackScreenCountdown, setBlackScreenCountdown] = useState(null);

  const canvasRef = useRef(document.createElement('canvas'));
  const consecutiveBlackCountRef = useRef(0);
  const countdownIntervalRef = useRef(null);
  const onAutoSkipRef = useRef(onAutoSkip);

  useEffect(() => {
    onAutoSkipRef.current = onAutoSkip;
  }, [onAutoSkip]);

  const triggerAutoSkip = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setBlackScreenCountdown(null);
    setIsBlackScreen(false);
    consecutiveBlackCountRef.current = 0;
    if (onAutoSkipRef.current) {
      console.log('[Moderation] Black screen persistent timeout -> Auto-skipping to next partner...');
      onAutoSkipRef.current();
    }
  }, []);

  const analyzeFrame = useCallback(() => {
    const video = videoElementRef.current;
    if (!video || video.readyState < 2 || !isEnabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 64; // Low-res downsample for ultra-fast processing
    canvas.height = 48;

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = frameData;

      let totalLuminance = 0;
      let skinTonePixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Perceived luminance (ITU-R BT.601)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += luminance;

        // Simplified skin-tone boundary check
        if (r > 95 && g > 40 && b > 20 && (Math.max(r, g, b) - Math.min(r, g, b) > 15) && Math.abs(r - g) > 15 && r > g && r > b) {
          skinTonePixels++;
        }
      }

      const avgLuminance = totalLuminance / totalPixels;
      const skinRatio = skinTonePixels / totalPixels;

      // 1. BLACK SCREEN / COVERED CAMERA CHECK
      // If average brightness is below 14, camera is covered or stream is pitch black
      if (avgLuminance < 14) {
        consecutiveBlackCountRef.current += 1;

        // After 2 consecutive black samples (~3-4 seconds), start auto-skip countdown
        if (consecutiveBlackCountRef.current >= 2 && !isBlackScreen) {
          setIsBlackScreen(true);
          setBlackScreenCountdown(5); // 5 second countdown

          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = setInterval(() => {
            setBlackScreenCountdown((prev) => {
              if (prev === null || prev <= 1) {
                triggerAutoSkip();
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Normal visible camera restored
        consecutiveBlackCountRef.current = 0;
        if (isBlackScreen) {
          setIsBlackScreen(false);
          setBlackScreenCountdown(null);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }
      }

      // 2. EXPOSURE SAFETY CHECK
      if (skinRatio > 0.75) {
        setIsFlagged(true);
        setSafetyScore(Math.max(20, Math.round((1 - skinRatio) * 100)));
      } else {
        setIsFlagged(false);
        setSafetyScore(98);
      }
    } catch (e) {
      // Ignore cross-origin frame capture errors if any
    }
  }, [videoElementRef, isEnabled, isBlackScreen, triggerAutoSkip]);

  useEffect(() => {
    if (!isEnabled) return;
    const interval = setInterval(analyzeFrame, 1500); // Sample every 1.5 seconds
    return () => {
      clearInterval(interval);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [analyzeFrame, isEnabled]);

  const toggleBlur = () => setIsBlurActive((prev) => !prev);

  const cancelBlackScreenTimer = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setBlackScreenCountdown(null);
    setIsBlackScreen(false);
    consecutiveBlackCountRef.current = -10; // Pause check for a while
  };

  return {
    isFlagged,
    safetyScore,
    isBlurActive,
    isBlackScreen,
    blackScreenCountdown,
    toggleBlur,
    setIsBlurActive,
    cancelBlackScreenTimer,
    triggerAutoSkip
  };
};
