import ytdl from "ytdl-core";
import ytpl from "ytpl";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";

async function downloadAndProcessYouTubeVideos(
  playlistId,
  baseDir = "./videos",
) {
  const downloadDir = path.join(baseDir, "downloads");
  const processedDir = path.join(baseDir, "processed");

  // Ensure directories exist
  if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir, { recursive: true });
  if (!fs.existsSync(processedDir))
    fs.mkdirSync(processedDir, { recursive: true });

  // Fetch playlist videos
  const playlist = await ytpl(playlistId);
  const videoUrls = playlist.items.map((item) => item.shortUrl);

  // Download and process each video
  for (const url of videoUrls) {
    try {
      console.log(`Fetching info for: ${url}`);
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_"); // Replace spaces and special characters with underscores
      const downloadPath = path.join(downloadDir, `${title}.mp4`);
      const processedPath = path.join(processedDir, `${title}.mp4`);

      // Skip if already processed
      if (fs.existsSync(processedPath)) {
        console.log(`Already processed: ${processedPath}`);
        continue;
      }

      // Download the video
      if (!fs.existsSync(downloadPath)) {
        console.log(`Downloading: ${url}`);
        await new Promise((resolve, reject) => {
          ytdl(url, { quality: "highestvideo" })
            .pipe(fs.createWriteStream(downloadPath))
            .on("finish", resolve)
            .on("error", reject);
        });
        console.log(`Downloaded: ${downloadPath}`);
      } else {
        console.log(`Already downloaded: ${downloadPath}`);
      }

      // Re-encode for MediaPipe
      console.log(`Processing: ${downloadPath}`);
      execSync(
        `ffmpeg -i "${downloadPath}" -vcodec h264 -acodec aac -strict -2 "${processedPath}"`,
        { stdio: "inherit" },
      );
      console.log(`Processed: ${processedPath}`);
    } catch (error) {
      console.error(`Error processing ${url}:`, error.message);
    }
  }
}

// Usage
const playlistId = "PLCF4C5DAE14FC7E89"; // Playlist ID
downloadAndProcessYouTubeVideos(playlistId);
