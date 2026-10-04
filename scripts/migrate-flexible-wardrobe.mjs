// Moves production data to categories and pieces. Prints the plan; writes it
// only with --write (at release).
//   node scripts/migrate-flexible-wardrobe.mjs [--write]
// Signs in with the firebase-tools login on this machine (`firebase login`).
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

import { migrateItem, migrateOutfit, migrateSettings } from "./migration.mjs";

const PROJECT = "alfred-wardrobe-stylist";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const isWrite = process.argv.includes("--write");

// firebase-tools' public OAuth client, as the CLI itself uses
const CLIENT = {
  client_id:
    "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
  client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
};

const token = async () => {
  const { tokens } = JSON.parse(
    readFileSync(
      `${homedir()}/.config/configstore/firebase-tools.json`,
      "utf8"
    )
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      ...CLIENT,
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  });
  if (!response.ok) throw new Error(`Sign-in failed: ${await response.text()}`);
  return (await response.json()).access_token;
};

const api = async (auth, url, init = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${auth}`, ...init.headers },
  });
  if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
  return response.json();
};

const list = async (auth, collection) => {
  const documents = [];
  let pageToken = "";
  do {
    const page = await api(
      auth,
      `${BASE}/${collection}?pageSize=300${pageToken && `&pageToken=${pageToken}`}`
    );
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  return documents;
};

const auth = await token();
const plan = [];
for (const [collection, migrate] of [
  ["wardrobe-items", migrateItem],
  ["outfits", migrateOutfit],
  ["settings", migrateSettings],
]) {
  for (const { name, fields = {} } of await list(auth, collection)) {
    const change = migrate(fields);
    if (!change) continue;
    const owner =
      fields.user?.stringValue ?? (collection === "settings" ? name.split("/").pop() : "?");
    plan.push({ name, owner, collection, ...change });
  }
}

const owners = new Set(plan.map(({ owner }) => owner));
for (const { name, owner, set, remove } of plan) {
  const id = name.split("/documents/")[1];
  const what = Object.entries(set)
    .map(([key, value]) =>
      key === "pieces"
        ? `pieces ← ${value.arrayValue.values.length} slots`
        : key === "type"
          ? `type → ${value.stringValue}`
          : `${key} → ${Object.keys(value.mapValue.fields).join(", ")}`
    )
    .join("; ");
  console.log(`${id}  [${owner.slice(0, 6)}]  ${what}${remove.length ? `; remove ${remove.join(", ")}` : ""}`);
}
console.log(
  `\n${plan.length} documents to change, across ${owners.size} account${owners.size === 1 ? "" : "s"}.`
);

if (!isWrite) {
  console.log("Dry run: nothing written. Run with --write to apply.");
} else {
  for (let index = 0; index < plan.length; index += 200) {
    await api(auth, `${BASE}:commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: plan.slice(index, index + 200).map(({ name, set, remove }) => ({
          update: { name, fields: set },
          updateMask: { fieldPaths: [...Object.keys(set), ...remove] },
          currentDocument: { exists: true },
        })),
      }),
    });
  }
  console.log(`Written: ${plan.length} documents.`);
}
