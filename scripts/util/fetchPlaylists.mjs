/**
 * Fetch audio playlists from the Plex server.
 *
 * @param {import('../types').PlexClient} client - The Plex client instance.
 *
 * @returns {Promise<Array<import('../types').Playlist>>} - A promise that resolves to an array of Playlist objects.
 */
export async function fetchPlaylists(client) {
  const playlistsResponse = await client.query("/playlists?playlistType=audio");

  return playlistsResponse.MediaContainer.Metadata || [];
}

/**
 * Find a specific playlist in the Plex library.
 *
 * @param {import('../types').PlexClient} client - The Plex client instance.
 * @param {Object} options - The search options.
 * @param {string} options.title - The title of the playlist to find.
 *
 * @returns {Promise<import('../types').Playlist | null>} - A promise that resolves to the found Playlist object or null if not found.
 */
export async function findPlaylist(client, options) {
  const playlists = await fetchPlaylists(client);

  return playlists.find((playlist) => playlist.title === options.title) || null;
}
