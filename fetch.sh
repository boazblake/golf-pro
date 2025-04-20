#!/bin/bash

INPUT_FILE="video_urls.txt"
OUTPUT_DIR="./src/video"

mkdir -p "$OUTPUT_DIR"

while read -r url; do
  echo "Downloading: $url"
  yt-dlp -o "${OUTPUT_DIR}/%(title)s.%(ext)s" "$url"
done < "$INPUT_FILE"
