import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
const PUBLIC_SANITY_DATASET = "production";
const PUBLIC_SANITY_PROJECT_ID = "cytjpxnv";
const PUBLIC_SANITY_API_VERSION = "2024-03-15";
const PUBLIC_SANITY_STUDIO_URL = "http://localhost:3333/";
console.log(PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_API_VERSION);
function assertEnvVar(value, name) {
  if (value === void 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
const dataset = assertEnvVar(PUBLIC_SANITY_DATASET, "PUBLIC_SANITY_DATASET");
const projectId = assertEnvVar(PUBLIC_SANITY_PROJECT_ID, "PUBLIC_SANITY_PROJECT_ID");
const apiVersion = PUBLIC_SANITY_API_VERSION;
const studioUrl = PUBLIC_SANITY_STUDIO_URL;
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl
  }
});
imageUrlBuilder(client);
export {
  assertEnvVar as a,
  client as c
};
