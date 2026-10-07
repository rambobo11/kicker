import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kicker",
    short_name: "Kicker",
    description: "Capture, quick wins, routines.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4f0",
    theme_color: "#f6f4f0",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
