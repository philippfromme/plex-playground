import fs from "fs";
import path from "path";

import "dotenv/config";

import PlexAPI from "plex-api";

import ignored from "./ignored.json" with { type: "json" };

const client = new PlexAPI({
  hostname: process.env.PLEX_HOSTNAME,
  port: 32400,
  token: process.env.PLEX_TOKEN,
});

async function getServerUUID() {
  try {
    const result = await client.query('/identity');
    const uuid = result.MediaContainer.machineIdentifier;
    return uuid;
  } catch (error) {
    console.error('Failed to fetch server UUID:', error);
  }
}

async function query() {
  console.log(' ____  _     _______  __');
  console.log('|  _ \\| |   | ____\\ \\/ /');
  console.log('| |_) | |   |  _|  \\  / ');
  console.log('|  __/| |___| |___ /  \\ ');
  console.log('|_|   |_____|_____/_/\\_\\');
  console.log('');

  const serverUUID = await getServerUUID();

  if (!serverUUID) {
    console.error('Could not retrieve server UUID. Exiting...');
    return;
  }

  console.log("Server UUID:", serverUUID);

  const result = await client.query("/");

  console.log("Connected to Plex server:", result.MediaContainer.friendlyName);
  console.log("Server version:", result.MediaContainer.version);
  console.log("Server build version:", result.MediaContainer.buildVersion);
  console.log("Server platform:", result.MediaContainer.platform);
  console.log(
    "Server platform version:",
    result.MediaContainer.platformVersion
  );

  const directories = await client.find("/");

  console.log("Directories in the root:", directories);

  // const movieDirectories = await client.find("/library/sections", {
  //   type: "movie",
  // });

  // console.log("Movie directories:", movieDirectories);

  // const tvDirectories = await client.find("/library/sections", {
  //   type: "show",
  // });

  // console.log("TV directories:", tvDirectories);

  const musicDirectories = await client.find("/library/sections", {
    type: "artist",
  });

  // console.log("Music directories:", musicDirectories);

  const musicSectionId = musicDirectories[0].key;

  const musicSection = await client.find(`/library/sections/${musicSectionId}`);

  console.log("Music section details:", musicSection);

  const tracksResponse = await client.query(
    `/library/sections/${musicSectionId}/all?type=10`
  );

  const tracks = tracksResponse.MediaContainer.Metadata || [];

  // console.log("Tracks:", tracks);

  console.log(`Total tracks found in the music section: ${tracks.length}`);

  const playlistsResponse = await client.query("/playlists?playlistType=audio");

  const playlists = playlistsResponse.MediaContainer.Metadata || [];

  // console.log("Playlists:", playlists);

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

  const filePath = path.join(
    process.cwd(),
    "output/tracks-not-in-playlist.txt"
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
    process.cwd(),
    "output/tracks-not-in-playlist.md"
  );

  fs.writeFileSync(
    markdownFilePath,
    "# Tracks not in any playlist\n\n"
  );

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
      return;
    }

    const server = serverUUID;

    const album = track.parentRatingKey || track.parentKey || track.ratingKey;

    const url = `http://${process.env.PLEX_HOSTNAME}:32400/web/index.html#!/server/${server}/details?key=%2Flibrary%2Fmetadata%2F${album}`;

    fs.appendFileSync(
      markdownFilePath,
      `- [${track.title} by ${track.grandparentTitle} (Album: ${track.parentTitle})](${url})\n`
    );
  });
}

query().catch(console.error);