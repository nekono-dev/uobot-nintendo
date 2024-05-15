# bskyCronBot

bskyCronBot is a bluesky bot backend by collecting info from website with cron trriger.

## At first

Create project.

```sh
firebase init
```

Create secret for function.

```sh
## setup bsky account app password and token for api
firebase functions:secrets:set BLUESKY_PASSWD
firebase functions:secrets:set API_TOKEN
```

Setup `.env`.

```sh
## post account of bluesky
BLUESKY_HANDLE="unofficalnintenbot.bsky.social"
## reference_url -> collect page url
REFERENCE_URL="https://www.nintendo.co.jp/news/whatsnew.xml"
```

## Debug

For debugging, firebase functions need to transpile code.

```sh
npm run build:watch
npm run serve
```

## Deploy

Deploy funciton.

```sh
firebase deploy
```

And [create GAS Project](https://script.google.com/home/my), setup script property on https://script.google.com/home/projects/(YOUR PROJECT ID)/settings

```sh
API_TOKEN="same_value_function_secret"
API_URL="firebase_function_url"
```

Create fetch client like below...

```ts
function app() {
  const apiToken =
    PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  const apiUrl = PropertiesService.getScriptProperties().getProperty("API_URL");
  const result = UrlFetchApp.fetch(apiUrl, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    payload: JSON.stringify({ token: apiToken }),
  }).getContentText("UTF-8");
  if (result !== "ok") {
    console.error(result);
  } else {
    console.info(result);
  }
}
```

Set Time-based trriger.

## Mainternance

If you need to check secret, run below...

```sh
firebase functions:secrets:access BLUESKY_PASSWD
firebase functions:secrets:access API_TOKEN
```

Delete secret value...

```sh
firebase functions:secrets:prune BLUESKY_PASSWD
firebase functions:secrets:prune API_TOKEN
```

If you wanna delete project, from dashboard: https://console.firebase.google.com/
