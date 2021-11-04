const { readFileSync, writeFileSync, existsSync } = require("fs");
const recursive = require("recursive-readdir");
const md5 = require("md5");
const path = require("path");

async function main() {
  const contentPagePath = path.resolve(__dirname, "../pages/content");
  const urlShortenerFilePath = path.resolve(__dirname, "../public/urls.json");
  const urlShortenerFileExists = existsSync(urlShortenerFilePath);

  const files = await recursive(contentPagePath, ["!*.js"]);
  const currentUrls = urlShortenerFileExists
    ? JSON.parse(readFileSync(urlShortenerFilePath, "utf-8"))
    : { redirects: [] };

  // Find all current hashes in the public urls JSON file
  const currentEntries = currentUrls.redirects.map((url) => url.destination);
  const currentHashes = currentUrls.redirects.map((url) => url.source);

  for (const file of files) {
    let outputHash = `/${md5(file).slice(0, 4)}`;

    const filePath = file
      // Replace the prefix
      .replace(`${process.cwd()}/pages`, "")
      // Replace file JavaScript suffix
      .replace(".js", "");

    // Check if we already have a hash for our file
    if (currentEntries.includes(filePath)) {
      continue;
    }

    // If our hash collides, rehash
    while (currentHashes.includes(outputHash)) {
      outputHash = `/${md5(outputHash).slice(0, 4)}`;
    }

    currentUrls.redirects.push({
      source: outputHash,
      destination: filePath,
      permanent: true,
    });
  }

  writeFileSync(
    urlShortenerFilePath,
    JSON.stringify(currentUrls, null, 2),
    "utf8"
  );
}

main();
