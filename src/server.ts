import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { extname, join } from "https://deno.land/std@0.201.0/path/mod.ts";

const PORT = 8000;
const VIDEO_DIR = "./videos"; // Path to your Downloads folder

// Function to list video files in the directory
async function listVideos() {
  const files = [];
  for await (const entry of Deno.readDir(VIDEO_DIR)) {
    if (
      entry.isFile &&
      [".webm", ".mp4", ".mkv", ".avi"].includes(extname(entry.name))
    ) {
      files.push(entry.name);
    }
  }
  return files;
}

// Serve the app and video files
serve(
  async (req) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === "/") {
      // Serve index.html
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/replay") {
      // Serve index.html
      const html = await Deno.readTextFile("./replay.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/api/videos") {
      // API endpoint to list videos
      const videos = await listVideos();
      return new Response(JSON.stringify(videos), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname.startsWith("/videos/")) {
      // Serve video files
      const fileName = url.pathname.replace("/videos/", "");
      const filePath = join(VIDEO_DIR, fileName);
      try {
        const video = await Deno.readFile(filePath);
        return new Response(video, {
          headers: { "Content-Type": "video/mp4" },
        });
      } catch {
        return new Response("Video not found", { status: 404 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  { port: PORT },
);

console.log(`Server running at http://localhost:${PORT}`);
