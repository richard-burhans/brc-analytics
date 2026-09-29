import { type ImageProps } from "next/image";

export const IMAGE_PROPS: Omit<ImageProps, "alt"> = {
  height: 623,
  priority: true,
  src: "/main/hero/cannabis.webp",
  width: 1112,
};
