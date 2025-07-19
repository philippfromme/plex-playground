/**
 * Fetch directories from the Plex server.
 *
 * @example
 * await fetchDirectories(client, 'playlists');
 *
 * @param {import('../types').PlexClient} client - The Plex client instance.
 * @param {string} key - The key of the directory to fetch.
 *
 * @returns {Promise<Array<import('../types').Directory>>} - A promise that resolves to an array of Directory objects.
 */
export async function fetchDirectories(client, key) {
  /** @type {Array<import('../types').Directory>} */
  const directories = await client.find("/");

  if (key) {
    return directories.filter((directory) => directory.key === key);
  }

  return directories;
}
