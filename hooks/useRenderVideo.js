import { useEffect } from 'react';
import { useTest } from '../contexts/TestProvider';
import { isShallowEqual } from '../utils/isShallowEqual';
import { usePrevious } from './usePrevious';

export const useRenderVideo = (
  canvasRef,
  mediaStream,
  isVideoDecodeReady,
  layout,
  subscribedVideos,
  participants,
  currentUserId
) => {
  const { callState } = useTest();
  const previousSubscribedVideos = usePrevious(subscribedVideos);
  const previousLayout = usePrevious(layout);
  const previousParticipants = usePrevious(participants);
  const previousIsVideoDecodeReady = usePrevious(isVideoDecodeReady);
  /**
   * gallery view without SharedArrayBuffer mode, self video is present by Video Element
   */
  const isSkipSelfVideo = false;
  useEffect(() => {
    if (callState !== 'joined') return;

    if (
      canvasRef.current &&
      layout &&
      layout.length > 0 &&
      isVideoDecodeReady
    ) {
      const addedSubscribers = subscribedVideos.filter(
        (id) => !(previousSubscribedVideos || []).includes(id)
      );
      const removedSubscribers = (previousSubscribedVideos || []).filter(
        (id) => !subscribedVideos.includes(id)
      );
      const unalteredSubscribers = subscribedVideos.filter((id) =>
        (previousSubscribedVideos || []).includes(id)
      );
      if (removedSubscribers.length > 0) {
        removedSubscribers.forEach(async (userId) => {
          if (
            !isSkipSelfVideo ||
            (isSkipSelfVideo && userId !== currentUserId)
          ) {
            await mediaStream?.stopRenderVideo(canvasRef.current, userId);
          }
        });
      }
      if (addedSubscribers.length > 0) {
        addedSubscribers.forEach(async (userId) => {
          const index = participants.findIndex(
            (user) => user.userId === userId
          );
          const cellDimension = layout[index];
          if (
            cellDimension &&
            (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))
          ) {
            const { width, height, x, y, quality } = cellDimension;
            await mediaStream?.renderVideo(
              canvasRef.current,
              userId,
              width,
              height,
              x,
              y,
              quality
            );
          }
        });
      }
      if (unalteredSubscribers.length > 0) {
        // layout changed
        if (
          previousLayout &&
          (layout.length !== previousLayout.length ||
            !isShallowEqual(layout[0], previousLayout[0]))
        ) {
          unalteredSubscribers.forEach((userId) => {
            const index = participants.findIndex(
              (user) => user.userId === userId
            );
            const cellDimension = layout[index];
            if (
              cellDimension &&
              (!isSkipSelfVideo ||
                (isSkipSelfVideo && userId !== currentUserId))
            ) {
              const { width, height, x, y, quality } = cellDimension;
              if (
                previousLayout &&
                previousLayout[index] &&
                previousLayout[index].quality !== quality
              ) {
                mediaStream?.renderVideo(
                  canvasRef.current,
                  userId,
                  width,
                  height,
                  x,
                  y,
                  quality
                );
              }
              mediaStream?.adjustRenderedVideoPosition(
                canvasRef.current,
                userId,
                width,
                height,
                x,
                y
              );
            }
          });
        }
        // the order of participants changed
        const participantsIds = participants.map((user) => user.userId);
        const previousParticipantsIds = previousParticipants?.map(
          (user) => user.userId
        );
        if (participantsIds.join('-') !== previousParticipantsIds?.join('-')) {
          unalteredSubscribers.forEach((userId) => {
            const index = participantsIds.findIndex((id) => id === userId);
            const previousIndex = previousParticipantsIds?.findIndex(
              (id) => id === userId
            );
            if (index !== previousIndex) {
              const cellDimension = layout[index];
              if (
                cellDimension &&
                (!isSkipSelfVideo ||
                  (isSkipSelfVideo && userId !== currentUserId))
              ) {
                const { width, height, x, y } = cellDimension;
                mediaStream?.adjustRenderedVideoPosition(
                  canvasRef.current,
                  userId,
                  width,
                  height,
                  x,
                  y
                );
              }
            }
          });
        }
      }
    }
  }, [
    callState,
    mediaStream,
    isVideoDecodeReady,
    layout,
    previousLayout,
    participants,
    previousParticipants,
    subscribedVideos,
    previousSubscribedVideos,
    isSkipSelfVideo,
    currentUserId,
    canvasRef,
  ]);

  useEffect(() => {
    if (callState !== 'joined') return;
    if (
      !previousIsVideoDecodeReady &&
      isVideoDecodeReady &&
      subscribedVideos.length > 0
    ) {
      subscribedVideos.forEach(async (userId) => {
        const index = participants.findIndex((user) => user.userId === userId);
        const cellDimension = layout[index];
        if (
          cellDimension &&
          (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))
        ) {
          const { width, height, x, y, quality } = cellDimension;
          await mediaStream?.renderVideo(
            canvasRef.current,
            userId,
            width,
            height,
            x,
            y,
            quality
          );
        }
      });
    }
  }, [
    callState,
    mediaStream,
    participants,
    subscribedVideos,
    isVideoDecodeReady,
    previousIsVideoDecodeReady,
    isSkipSelfVideo,
    currentUserId,
    canvasRef,
    layout,
  ]);
};
