import React, { forwardRef, useRef, useEffect } from 'react';

const DailyVideo = forwardRef(
  (
    {
      fit = 'contain',
      onResize,
      playableStyle = {},
      track,
      style = {},
      type = 'video',
      ...props
    },
    ref
  ) => {
    const internalRef = useRef(null);
    const videoRef = ref || internalRef;

    const videoTrack = track;

    /**
     * Handle canplay & picture-in-picture events.
     */
    useEffect(
      function setupVideoEvents() {
        const video = videoRef.current;
        if (!video) return;
        const handleCanPlay = () => {
          if (!video.paused) return;
          video.play();
        };
        const handleEnterPIP = () => {
          video.style.transform = 'scale(1)';
        };
        const handleLeavePIP = () => {
          video.style.transform = '';
          setTimeout(() => {
            if (video.paused) video.play();
          }, 100);
        };
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') return;
          if (!video.paused) return;
          video.play();
        };
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('enterpictureinpicture', handleEnterPIP);
        video.addEventListener('leavepictureinpicture', handleLeavePIP);

        // Videos can be paused if media was played in another app on iOS.
        // Resuming here, when returning back to Daily call.
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('enterpictureinpicture', handleEnterPIP);
          video.removeEventListener('leavepictureinpicture', handleLeavePIP);
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
          );
        };
      },
      [videoRef]
    );

    /**
     * Update srcObject.
     */
    useEffect(
      function updateSrcObject() {
        const video = videoRef.current;
        if (!video || !videoTrack) return;
        video.srcObject = new MediaStream([videoTrack]);
        video.load();
        return () => {
          // clean up when unmounted
          video.srcObject = null;
          video.load();
        };
      },
      [videoRef, videoTrack, videoTrack?.id]
    );

    /**
     * Add optional event listener for resize event so the parent component
     * can know the video's native aspect ratio.
     */
    useEffect(
      function reportVideoDimensions() {
        const video = videoRef.current;
        if (!onResize || !video) return;

        let frame;
        const handleResize = () => {
          if (!video) return;
          if (frame) cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            if (document.hidden) return;
            const settings = videoTrack?.getSettings();
            if (settings?.width && settings?.height) {
              onResize({
                aspectRatio: settings.width / settings.height,
                height: settings.height,
                width: settings.width,
              });
            } else if (video) {
              onResize({
                aspectRatio: video.videoWidth / video.videoHeight,
                height: video.videoHeight,
                width: video.videoWidth,
              });
            }
          });
        };

        handleResize();
        video?.addEventListener('resize', handleResize);

        return () => video?.removeEventListener('resize', handleResize);
      },
      [onResize, videoRef, videoTrack]
    );

    return (
      <video
        autoPlay
        muted
        playsInline
        ref={videoRef}
        style={{
          objectFit: fit,
          transform: 'scale(-1, 1)',
          ...style,
        }}
        {...props}
      />
    );
  }
);
DailyVideo.displayName = 'DailyVideo';

export default DailyVideo;
