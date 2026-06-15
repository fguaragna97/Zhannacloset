import { useEffect, useRef, useState } from 'react';

export function WebcamCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const countdownTimers = useRef([]);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1600 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (err) {
        setError(err.message || 'Could not access camera');
      }
    }
    start();
    return () => {
      cancelled = true;
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    countdownTimers.current.forEach(clearTimeout);
    countdownTimers.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function startCountdown() {
    setCountdown(3);
    countdownTimers.current.push(setTimeout(() => setCountdown(2), 1000));
    countdownTimers.current.push(setTimeout(() => setCountdown(1), 2000));
    countdownTimers.current.push(setTimeout(() => {
      setCountdown(null);
      capture();
    }, 3000));
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setPreviewBlob(blob);
    }, 'image/jpeg', 0.92);
  }

  function retake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPreviewBlob(null);
  }

  function confirm() {
    if (!previewBlob) return;
    const file = new File([previewBlob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ink">
        {!preview && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        {preview && (
          <img src={preview} alt="captured" className="w-full h-full object-cover" />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-bg p-6 text-center">
            <p className="text-sm">{error}</p>
          </div>
        )}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
            <span className="font-display text-9xl text-bg drop-shadow-lg animate-fade-in">{countdown}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-center">
        {!preview && (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-full border border-ink/15 text-ink hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={startCountdown}
              disabled={!ready || countdown !== null || !!error}
              className="px-7 py-3 rounded-full bg-ink text-bg disabled:opacity-50 hover:scale-[1.02] transition-transform"
            >
              {countdown !== null ? 'Capturing…' : 'Capture'}
            </button>
          </>
        )}
        {preview && (
          <>
            <button
              type="button"
              onClick={retake}
              className="px-5 py-3 rounded-full border border-ink/15 text-ink hover:bg-ink/5 transition-colors"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={confirm}
              className="px-7 py-3 rounded-full bg-ink text-bg hover:scale-[1.02] transition-transform"
            >
              Use this photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
