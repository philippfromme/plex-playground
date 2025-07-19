import fs from "fs";
import path from "path";

import "dotenv/config";

import { createClient } from "../util/createClient.mjs";
import { fetchPlaylists } from "../util/fetchPlaylists.mjs";

const client = await createClient();

const playlistsMetadata = await fetchPlaylists(client);

const playlistsExported = [];

for (const playlistMetadata of playlistsMetadata) {
  console.log(`Exporting playlist: ${playlistMetadata.title}`);

  const playlistItemsResponse = await client.query(
    `/playlists/${playlistMetadata.ratingKey}/items`
  );

  const tracksMetadata = playlistItemsResponse.MediaContainer.Metadata || [];

  const tracks = [];

  for (const track of tracksMetadata) {
    try {
      const tracksResponse = await client.query(
        `/library/metadata/${track.ratingKey}`
      );

      const trackMetadata = tracksResponse.MediaContainer.Metadata[0];

      const trackTitle = trackMetadata.title || "<Unknown Title>";
      const trackArtist = trackMetadata.grandparentTitle || "<Unknown Artist>";
      const trackAlbum = trackMetadata.parentTitle || "<Unknown Album>";

      tracks.push(`${trackArtist},${trackAlbum},${trackTitle}`);
    } catch (error) {
      console.error(
        `Failed to fetch track metadata for ratingKey ${track.ratingKey}:`,
        error
      );
    }
  }

  playlistsExported.push({
    title: playlistMetadata.title,
    tracks: tracks,
  });
}

const outputDir = path.join(process.cwd(), "output", "export-playlists");

fs.mkdirSync(outputDir, { recursive: true });

playlistsExported.forEach((playlist) => {
  const filePath = path.join(outputDir, `${playlist.title}.txt`);

  fs.writeFileSync(filePath, playlist.tracks.join("\n"));

  console.log(`Playlist ${playlist.title} saved to ${filePath}`);
});
