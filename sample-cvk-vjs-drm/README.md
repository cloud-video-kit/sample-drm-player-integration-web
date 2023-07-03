# Video.js integration with DRM assets

The provided application demonstrates how to utilize the Cloud Video Kit service in conjunction with the open-source Video.js player (and videojs-contrib-eme extension) to play DRM-protected content. It showcases the handling of different DRM systems supported by various browsers and devices. For further information on platform compatibility and supported DRM systems, please visit the following link: https://www.drm.cloud/platform-compatibility.

The code sample below detects the DRM systems supported by the user's browser and selects the appropriate one for playback. The application includes an express.js web server responsible for generating DRM tokens and serving the webpage.

# Installation
Sample require node in version 18 or higher

Installation steps:
1. Type npm install in terminal
2. Run `npm run start` command

# Required data
The code sample requires certain data to function properly. You need to provide the following information:
- FairPlay certificate URL
- PlayReady server license URL
- Widevine server license URL
- DRM signing key

**Please fill the .env file with these details.** The URLs can be obtained from the DRM console settings page.

![DRM settings](https://iili.io/HiNWReV.png)

# How it works

1. User requests a page with DRM content.
2. Server generates a short-lived JWT User Token, which consists of DRM configuration and is used for authentication (for more information, read: https://developers.drm.cloud/licence-acquisition/licence-acquisition#acquisition-sequence). The server includes the User Token as part of the served page.

```js
const jwt = require("jsonwebtoken");

function getDrmToken() {
  const expirationDateUnixTimestamp = Math.floor(Date.now() / 1000) + 60 * 10; // short-lived token, eg. 10 minutes
  const expirationDateISOString = new Date(expirationDateUnixTimestamp * 1000).toISOString();
  return jwt.sign(
    {
      exp: expirationDateUnixTimestamp,
      drmTokenInfo: {
        exp: expirationDateISOString,
        kid: ["*"],
        p: {},
      },
    },
    Buffer.from(process.env.SIGNING_KEY, "base64"),
    { algorithm: "HS256" }
  );
}

app.get("/", async function (req, res) {
  let index = fs.readFileSync(path.join(__dirname, "index.html"), { encoding: "utf8" });
  const userToken = getDrmToken();
  
  ...

  if (userToken) {
    index = index.replaceAll("%USER_TOKEN%", userToken);
  }

  return res.send(index);
});
```
3. User Token is added as a parameter to the DRM server license URLs.
4. Application recognizes the DRM system supported by the user's browser, selects the appropriate one, and calls the license server.
5. When the license server returns the license, the player is allowed to play the DRM video.
