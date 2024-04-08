const path = require("path");
const fs = require("fs");
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config({ path: ['.env.local', '.env'] });

const app = express();
const port = process.env.PORT || 8080;

if (!process.env.SIGNING_KEY) {
  console.log("fill .env file");

  return;
}

function getDrmToken() {
  // More info about drm token parameters here: https://developers.drm.cloud/licence-acquisition/how-to-issue-license#jwt-token-generation-example
  const expirationDateUnixTimestamp = Math.floor(Date.now() / 1000) + 60 * 10; // short-lived token, eg. 10 minutes
  return jwt.sign(
    {
      exp: expirationDateUnixTimestamp,
      kid: ["*"],
    },
    Buffer.from(process.env.SIGNING_KEY, "base64"),
    { algorithm: "HS256" }
  );
}

app.get("/", async function (req, res) {
  const userToken = getDrmToken();

  let index = fs.readFileSync(path.join(__dirname, "index.html"), {
    encoding: "utf8",
  });

  [
    "MPEG_DASH_URL",
    "HLS_URL",
    "WIDEVINE_LICENSE_ENDPOINT",
    "PLAYREADY_LICENSE_ENDPOINT",
    "FAIR_PLAY_CERTIFICATE_URL",
    "FAIR_PLAY_LICENSE_ENDPOINT"
  ].forEach((variable) => {
    index = index.replaceAll(`%${variable}%`, process.env[variable]);
  });

  if (userToken) {
    index = index.replaceAll("%USER_TOKEN%", userToken);
  }

  return res.send(index);
});

app.listen(port);

console.log("Server started at http://localhost:" + port);
