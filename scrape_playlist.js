import puppeteer from "puppeteer";
import fs from "fs";

async function scrapeYouTubePlaylist(
  playlistUrl,
  outputFile = "video_urls.txt",
) {
  const browser = await puppeteer.launch({ headless: true }); // Set to false for debugging
  const page = await browser.newPage();
  await page.goto(playlistUrl, { waitUntil: "networkidle2" });

  console.log("Scraping playlist...");

  // Scroll to load all videos
  let lastHeight = 0;
  while (true) {
    const height = await page.evaluate("document.documentElement.scrollHeight");
    if (height === lastHeight) break; // Break when no more scrolling
    lastHeight = height;
    await page.evaluate(
      "window.scrollTo(0, document.documentElement.scrollHeight)",
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Extract video URLs
  const videoUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a#video-title")).map(
      (a) => a.href,
    );
  });

  console.log(`Found ${videoUrls.length} videos.`);
  fs.writeFileSync(outputFile, videoUrls.join("\n"));
  console.log(`Saved video URLs to ${outputFile}`);

  await browser.close();
}

const playlistUrl = "https://www.youtube.com/playlist?list=PLCF4C5DAE14FC7E89"; // Replace with your playlist URL
scrapeYouTubePlaylist(playlistUrl);
