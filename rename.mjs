import { join } from "https://deno.land/std@0.201.0/path/mod.ts";

const VIDEO_DIR = "./src/videos/";
async function sanitizeFileNames() {
  for await (const entry of Deno.readDir(VIDEO_DIR)) {
    if (entry.isFile && /\.(webm|mp4|mkv|avi)$/i.test(entry.name)) {
      const sanitizedName = entry.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      if (sanitizedName !== entry.name) {
        const oldPath = join(VIDEO_DIR, entry.name);
        const newPath = join(VIDEO_DIR, sanitizedName);
        await Deno.rename(oldPath, newPath);
        console.log(`Renamed: "${entry.name}" -> "${sanitizedName}"`);
      }
    }
  }
}

await sanitizeFileNames();
