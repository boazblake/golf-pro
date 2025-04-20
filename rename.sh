#!/bin/bash
OUTPUT_DIR="./src/video"

# Ensure the output directory exists
if [[ ! -d "$OUTPUT_DIR" ]]; then
  echo "Error: Directory $OUTPUT_DIR does not exist."
  exit 1
fi

# Rename files in the directory
for file in "$OUTPUT_DIR"/*; do
  if [[ -f "$file" ]]; then
    # Replace spaces and special characters with underscores
    new_file=$(echo "$file" | sed 's/[^a-zA-Z0-9._-]/_/g')
    
    # Prevent overwriting if the target file already exists
    if [[ "$file" != "$new_file" ]]; then
      if [[ -e "$new_file" ]]; then
        echo "Error: Target file $new_file already exists. Skipping $file."
        continue
      fi
      mv "$file" "$new_file"
      echo "Renamed: $file -> $new_file"
    fi
  fi
done
