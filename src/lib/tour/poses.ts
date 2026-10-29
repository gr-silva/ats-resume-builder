export const PASSARU_POSES = {
  wave: "/mascot/passaru-wave.png",
  point: "/mascot/passaru-point.png",
  show: "/mascot/passaru-show.png",
  read: "/mascot/passaru-read.png",
  think: "/mascot/passaru-think.png",
  yay: "/mascot/passaru-yay.png",
} as const;

export type PassaruPose = keyof typeof PASSARU_POSES;
