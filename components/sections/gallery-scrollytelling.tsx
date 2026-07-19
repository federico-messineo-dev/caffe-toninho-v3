import fs from "fs";
import path from "path";
import { GalleryScrollytellingClient } from "./gallery-scrollytelling-client";

const FRAMES_DIR = path.join(process.cwd(), "public", "images", "webp");

function getFramePaths(): string[] {
  const files = fs.readdirSync(FRAMES_DIR);
  const webpFiles = files.filter((f) => f.endsWith(".webp"));

  webpFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  return webpFiles.map((f) => `/images/webp/${f}`);
}

export function GalleryScrollytelling() {
  const frames = getFramePaths();
  return <GalleryScrollytellingClient frames={frames} />;
}
