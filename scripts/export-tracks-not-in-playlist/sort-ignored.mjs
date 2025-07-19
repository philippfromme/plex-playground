import fs from "fs";
import path from "path";

const ignored = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "scripts/tracks-not-in-playlist/ignored.json"),
    "utf-8"
  )
);

const sortedIgnored = ignored.sort((a, b) => {
  if (a.type === b.type) {
    return a.name.localeCompare(b.name);
  }
  return a.type.localeCompare(b.type);
});

fs.writeFileSync(
  path.join(process.cwd(), "scripts/tracks-not-in-playlist/ignored.json"),
  JSON.stringify(sortedIgnored, null, 2)
);
