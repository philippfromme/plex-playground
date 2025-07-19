import "dotenv/config";

import PlexAPI from "plex-api";

export async function getServerUUID(client) {
  try {
    const result = await client.query("/identity");

    const uuid = result.MediaContainer.machineIdentifier;

    return uuid;
  } catch (error) {
    console.error("Failed to fetch server UUID:", error);
  }
}

export async function createClient(checkUUID = true) {
  console.log(" ____  _     _______  __");
  console.log("|  _ \\| |   | ____\\ \\/ /");
  console.log("| |_) | |   |  _|  \\  / ");
  console.log("|  __/| |___| |___ /  \\ ");
  console.log("|_|   |_____|_____/_/\\_\\");
  console.log("");

  const client = new PlexAPI({
    hostname: process.env.PLEX_HOSTNAME,
    port: 32400,
    token: process.env.PLEX_TOKEN,
  });

  if (checkUUID) {
    const serverUUID = await getServerUUID(client);

    if (!serverUUID) {
      console.error("Could not retrieve server UUID. Exiting...");

      return null;
    }

    const result = await client.query("/");

    // Build ASCII table
    const table = [
      { Property: "Server UUID", Value: serverUUID },
      { Property: "Server name", Value: result.MediaContainer.friendlyName },
      { Property: "Server version", Value: result.MediaContainer.version },
      {
        Property: "Server build version",
        Value: result.MediaContainer.buildVersion,
      },
      { Property: "Server platform", Value: result.MediaContainer.platform },
      {
        Property: "Server platform version",
        Value: result.MediaContainer.platformVersion,
      },
    ];

    // Calculate column widths
    const propWidth = Math.max(
      ...table.map((row) => row.Property.length),
      "Property".length
    );
    const valueWidth = Math.max(
      ...table.map((row) => String(row.Value).length),
      "Value".length
    );

    const pad = (str, len) => str + " ".repeat(len - str.length);

    console.log(
      "+" + "-".repeat(propWidth + 2) + "+" + "-".repeat(valueWidth + 2) + "+"
    );

    for (const row of table) {
      console.log(
        "| " +
          pad(row.Property, propWidth) +
          " | " +
          pad(String(row.Value), valueWidth) +
          " |"
      );
    }

    console.log(
      "+" + "-".repeat(propWidth + 2) + "+" + "-".repeat(valueWidth + 2) + "+"
    );
  }

  return client;
}
