import fs from "fs";
import path from "path";

import "dotenv/config";

import { createClient, getServerUUID } from "../util/createClient.mjs";
import { fetchDirectories } from "../util/fetchDirectories.mjs";
import { fetchPlaylists } from "../util/fetchPlaylists.mjs";
import { fetchTracks } from "../util/fetchTracks.mjs";

import ignored from "./ignored.json" with { type: "json" };

const client = await createClient();

console.log(await fetchDirectories(client, "artist"));

const tracks = await fetchTracks(client);

console.log(`Total tracks found in the music section: ${tracks.length}`);

const playlists = await fetchPlaylists(client);

console.log(`Total playlists found: ${playlists.length}`);

const playlistTrackKeys = new Set();

for (const playlist of playlists) {
  const playlistItemsResponse = await client.query(
    `/playlists/${playlist.ratingKey}/items`
  );

  const items = playlistItemsResponse.MediaContainer.Metadata || [];

  items.forEach((item) => playlistTrackKeys.add(item.ratingKey));
}

// console.log(`playlistTrackKeys:`, Array.from(playlistTrackKeys));

console.log(`Total unique tracks in playlists: ${playlistTrackKeys.size}`);

const tracksNotInPlaylists = tracks.filter(
  (track) => !playlistTrackKeys.has(track.ratingKey)
);

const outputDir = path.join(process.cwd(), "output", "export-tracks-not-in-playlist");

fs.mkdirSync(outputDir, { recursive: true });

const filePath = path.join(
  outputDir,
  "tracks-not-in-playlist.txt"
);

fs.writeFileSync(filePath, "Tracks not in any playlist:\n\n");

let count = 0,
    ignoredCount = 0;

tracksNotInPlaylists.forEach((track) => {
  // Skip ignored artists, albums, and tracks
  if (
    ignored.some(
      (ignore) =>
        (ignore.type === "artist" &&
          track.grandparentTitle === ignore.name) ||
        (ignore.type === "album" && track.parentTitle === ignore.name) ||
        (ignore.type === "track" && track.title === ignore.name)
    )
  ) {
    ignoredCount++;

    return;
  }

  count++;

  fs.appendFileSync(
    filePath,
    `${track.title} by ${track.grandparentTitle} (Album: ${track.parentTitle})\n`
  );
});

console.log(`Total tracks not in any playlist: ${count} (ignored: ${ignoredCount})`);

console.log(`Tracks not in any playlist written to: ${filePath}`);

// Create markdown file with the same content and links to each track
const markdownFilePath = path.join(
  outputDir,
  "tracks-not-in-playlist.md"
);

fs.writeFileSync(
  markdownFilePath,
  "# Tracks not in any playlist\n\n"
);

tracksNotInPlaylists.forEach(async (track) => {
  // Skip ignored artists, albums, and tracks
  if (
    ignored.some(
      (ignore) =>
        (ignore.type === "artist" &&
          track.grandparentTitle === ignore.name) ||
        (ignore.type === "album" && track.parentTitle === ignore.name) ||
        (ignore.type === "track" && track.title === ignore.name)
    )
  ) {
    return;
  }

  const server = await getServerUUID(client);

  const album = track.parentRatingKey || track.parentKey || track.ratingKey;

  const url = `http://${process.env.PLEX_HOSTNAME}:32400/web/index.html#!/server/${server}/details?key=%2Flibrary%2Fmetadata%2F${album}`;

  fs.appendFileSync(
    markdownFilePath,
    `- [${track.title} by ${track.grandparentTitle} (Album: ${track.parentTitle})](${url})\n`
  );
});

console.log(`Tracks not in any playlist written to: ${markdownFilePath}`);