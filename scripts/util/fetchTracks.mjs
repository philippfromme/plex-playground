/**
 * Fetch audio tracks from the Plex server.
 *
 * @param {import('../types').PlexClient} client - The Plex client instance.
 *
 * @returns {Promise<Array<import('../types').Track>>} - A promise that resolves to an array of Track objects.
 */
export async function fetchTracks(client) {
  const musicDirectories = await client.find("/library/sections", {
    type: "artist",
  });

  const musicSectionId = musicDirectories[0].key;

  const tracksResponse = await client.query(
    `/library/sections/${musicSectionId}/all?type=10`
  );

  return tracksResponse.MediaContainer.Metadata || [];
}

/**
 * Find a specific track in the Plex library.
 *
 * @param {import('../types').PlexClient} client - The Plex client instance.
 * @param {Object} options - The search options.
 * @param {string} options.title - The title of the track to find.
 * @param {string} options.artist - The artist of the track to find.
 * @param {string} options.album - The album of the track to find.
 *
 * @returns {Promise<import('../types').Track | null>} - A promise that resolves to the found Track object or null if not found.
 */
export async function findTrack(client, options) {
  const tracks = await fetchTracks(client);

  return (
    tracks.find(
      (track) =>
        track.title === options.title &&
        track.parentTitle === options.artist &&
        track.grandparentTitle === options.album
    ) || null
  );
}
